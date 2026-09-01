const fs = require('fs');
const path = require('path');
const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const cacheService = require('../services/cacheService');
const backupService = require('../services/backupService');

// Helper to convert Base64 data URLs to permanent disk files & register in Media Library
const saveBase64Image = (dataUrl, suggestedName = 'project-image') => {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image')) {
    return dataUrl;
  }
  try {
    const { UPLOADS_DIR } = require('../config/persistentStorage');
    const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches) return dataUrl;
    const rawExt = matches[1].toLowerCase();
    const ext = rawExt === 'jpeg' ? 'jpg' : (rawExt.includes('svg') ? 'svg' : (rawExt.includes('png') ? 'png' : 'webp'));
    const buffer = Buffer.from(matches[2], 'base64');
    const cleanName = (suggestedName || 'image').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
    const filename = `${cleanName}-${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);
    fs.writeFileSync(filePath, buffer);
    const fileUrl = `/uploads/${filename}`;
    console.log(`💾 Saved base64 image directly to disk file: ${filePath}`);

    // Asynchronously register in Media Library
    prisma.media.create({
      data: {
        fileName: filename,
        fileUrl: fileUrl,
        fileType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
        fileSize: buffer.length,
        altText: suggestedName || filename,
        source: 'LOCAL',
      },
    }).catch(() => {});

    return fileUrl;
  } catch (e) {
    console.warn('Could not save base64 image to disk:', e.message);
    return dataUrl;
  }
};

// Helper to generate URL-friendly slug
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Safe JSON parser for string or object fields
const parseJsonField = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch (e) {
    return [];
  }
};

const formatJsonField = (val) => {
  if (!val) return null;
  if (typeof val === 'string') return val;
  return JSON.stringify(val);
};

const formatProject = (project) => {
  if (!project) return null;
  return {
    ...project,
    tags: parseJsonField(project.tags),
    tools: parseJsonField(project.tools),
    galleryImages: parseJsonField(project.galleryImages),
  };
};

/**
 * Public: Get all active projects with optional filters
 * Wrapped with Multi-Tier Distributed Cache & Invalidation
 * GET /api/projects
 */
const getPublicProjects = async (req, res, next) => {
  try {
    const { category, serviceId, serviceSlug, featured, search, limit } = req.query;

    const cacheKey = `portfolio:projects:list:${JSON.stringify({
      c: category || '',
      sId: serviceId || '',
      sSlug: serviceSlug || '',
      f: featured || '',
      q: search || '',
      l: limit || '',
    })}`;

    const formatted = await cacheService.wrap(
      cacheKey,
      async () => {
        const isValid = (val) => val && val !== 'undefined' && val !== 'null' && typeof val === 'string' && val.trim() !== '';
        const where = { active: true };

        if (isValid(category) && category !== 'All') {
          where.OR = [
            { category: category },
            { category: { contains: category } },
            { tags: { contains: category } },
          ];
        }

        if (isValid(serviceId)) {
          where.serviceId = serviceId;
        } else if (isValid(serviceSlug)) {
          where.serviceSlug = serviceSlug;
        }

        if (featured === 'true') {
          where.featured = true;
        }

        if (isValid(search)) {
          const s = search.trim();
          where.OR = [
            { title: { contains: s } },
            { summary: { contains: s } },
            { client: { contains: s } },
            { category: { contains: s } },
            { tags: { contains: s } },
          ];
        }

        let projects = [];
        try {
          projects = await prisma.project.findMany({
            where,
            orderBy: [{ featured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
            take: limit ? parseInt(limit, 10) : undefined,
            include: {
              service: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                },
              },
            },
          });
        } catch (dbErr) {
          console.warn('Projects DB lookup warning:', dbErr.message);
        }

        return Array.isArray(projects) ? projects.map(formatProject) : [];
      },
      { ttl: 1800, tags: ['projects'] }
    );

    return successResponse(res, formatted || [], 'Projects retrieved successfully.');
  } catch (err) {
    return successResponse(res, [], 'Fallback empty projects.');
  }
};

/**
 * Public: Get single project by slug
 * Wrapped with Multi-Tier Distributed Cache & Invalidation
 * GET /api/projects/:slug
 */
const getProjectBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const data = await cacheService.wrap(
      `portfolio:projects:slug:${slug}`,
      async () => {
        const project = await prisma.project.findUnique({
          where: { slug },
          include: {
            service: true,
          },
        });

        if (!project || (!project.active && (!req.user || req.user.role !== 'ADMIN'))) {
          return null;
        }

        // Get related projects from the same service or category
        const relatedProjects = await prisma.project.findMany({
          where: {
            OR: [
              { serviceId: project.serviceId || undefined },
              { category: project.category },
            ],
            id: { not: project.id },
            active: true,
          },
          take: 3,
          orderBy: { order: 'asc' },
          include: {
            service: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        });

        return {
          project: formatProject(project),
          relatedProjects: (relatedProjects || []).map(formatProject),
        };
      },
      { ttl: 3600, tags: ['projects'] }
    );

    if (!data) {
      return errorResponse(res, 'Project not found.', 404);
    }

    return successResponse(res, data, 'Project details retrieved.');
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Get all projects (including inactive)
 * GET /api/admin/projects
 */
const getAllProjectsAdmin = async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      include: {
        service: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    }).catch(() => []);

    return successResponse(res, (projects || []).map(formatProject), 'All admin projects retrieved.');
  } catch (err) {
    return successResponse(res, [], 'Fallback admin projects.');
  }
};

/**
 * Admin: Create new project
 * POST /api/admin/projects
 */
const createProject = async (req, res, next) => {
  try {
    const {
      title,
      slug,
      category,
      serviceId,
      serviceSlug,
      client,
      year,
      summary,
      description,
      coverImage,
      galleryImages,
      liveUrl,
      githubUrl,
      figmaUrl,
      behanceUrl,
      dribbbleUrl,
      featured,
      order,
      tags,
      tools,
      challenges,
      solutions,
      results,
      goal,
      solution,
      seoTitle,
      seoDescription,
      altText,
      active,
    } = req.body;

    const effectiveTitle = (title && typeof title === 'string' && title.trim()) ? title.trim() : 'New Creative Project';
    const effectiveCategory = (category && typeof category === 'string' && category.trim()) ? category.trim() : 'Logo & Branding';
    const effectiveSummary = (summary && typeof summary === 'string' && summary.trim()) ? summary.trim() : `Commercial showcase project for ${effectiveCategory}.`;
    const effectiveDescription = (description && typeof description === 'string' && description.trim()) ? description.trim() : `Delivered high-converting visual design deliverables for ${effectiveTitle}.`;
    
    // Convert Base64 image to permanent disk file if needed
    const persistentCoverImage = saveBase64Image(coverImage, effectiveTitle) || '';

    const finalSlug = slug ? generateSlug(slug) : generateSlug(effectiveTitle);

    // Verify slug uniqueness
    const existing = await prisma.project.findUnique({ where: { slug: finalSlug } });
    const uniqueSlug = existing ? `${finalSlug}-${Date.now()}` : finalSlug;

    // Resolve valid serviceId and serviceSlug safely to avoid foreign key violations
    let validServiceId = null;
    let resolvedServiceSlug = serviceSlug || null;
    if (serviceId) {
      const s = await prisma.service.findUnique({ where: { id: serviceId } }).catch(() => null);
      if (s) {
        validServiceId = s.id;
        resolvedServiceSlug = s.slug;
      } else {
        const sByCat = await prisma.service.findFirst({
          where: {
            OR: [
              { title: effectiveCategory },
              { slug: serviceSlug || '' },
            ],
          },
        }).catch(() => null);
        if (sByCat) {
          validServiceId = sByCat.id;
          resolvedServiceSlug = sByCat.slug;
        }
      }
    }

    const newProject = await prisma.project.create({
      data: {
        title: effectiveTitle,
        slug: uniqueSlug,
        category: effectiveCategory,
        serviceId: validServiceId,
        serviceSlug: resolvedServiceSlug,
        client: client ? client.trim() : null,
        year: year ? year.trim() : new Date().getFullYear().toString(),
        summary: effectiveSummary,
        description: effectiveDescription,
        coverImage: persistentCoverImage,
        galleryImages: formatJsonField(
          Array.isArray(galleryImages)
            ? galleryImages.map((img) => saveBase64Image(img, effectiveTitle))
            : galleryImages
        ),
        liveUrl: liveUrl || null,
        githubUrl: githubUrl || null,
        figmaUrl: figmaUrl || null,
        behanceUrl: behanceUrl || null,
        dribbbleUrl: dribbbleUrl || null,
        featured: featured === true || featured === 'true',
        order: order ? parseInt(order, 10) : 0,
        tags: formatJsonField(tags || [effectiveCategory]),
        tools: formatJsonField(tools),
        challenges: challenges || null,
        solutions: solutions || null,
        results: results || null,
        goal: goal || null,
        solution: solution || null,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        altText: altText || null,
        active: active !== undefined ? (active === true || active === 'true') : true,
      },
      include: {
        service: true,
      },
    });

    // Invalidate distributed cache
    cacheService.invalidateTags(['projects', 'homepage']);

    return successResponse(res, formatProject(newProject), 'Project created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Update existing project
 * PUT /api/admin/projects/:id
 */
const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      category,
      serviceId,
      serviceSlug,
      client,
      year,
      summary,
      description,
      coverImage,
      galleryImages,
      liveUrl,
      githubUrl,
      figmaUrl,
      behanceUrl,
      dribbbleUrl,
      featured,
      order,
      tags,
      tools,
      challenges,
      solutions,
      results,
      goal,
      solution,
      seoTitle,
      seoDescription,
      altText,
      active,
    } = req.body;

    // Resilient lookup by ID, slug, or title
    let existingProject = await prisma.project.findUnique({ where: { id } }).catch(() => null);
    if (!existingProject && slug) {
      existingProject = await prisma.project.findUnique({ where: { slug: generateSlug(slug) } }).catch(() => null);
    }
    if (!existingProject && title) {
      existingProject = await prisma.project.findFirst({ where: { title: title.trim() } }).catch(() => null);
    }

    // If still not found, create new project dynamically
    if (!existingProject) {
      return createProject(req, res, next);
    }

    const targetId = existingProject.id;
    let finalSlug = existingProject.slug;
    if (slug && slug !== existingProject.slug) {
      finalSlug = generateSlug(slug);
      const duplicate = await prisma.project.findUnique({ where: { slug: finalSlug } }).catch(() => null);
      if (duplicate && duplicate.id !== targetId) {
        finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
      }
    }

    // Resolve valid serviceId and serviceSlug safely to prevent FK constraint failures
    let validServiceId = undefined;
    let resolvedServiceSlug = serviceSlug !== undefined ? serviceSlug : existingProject.serviceSlug;
    if (serviceId !== undefined) {
      if (serviceId && serviceId !== 'null' && serviceId !== '') {
        const s = await prisma.service.findUnique({ where: { id: serviceId } }).catch(() => null);
        if (s) {
          validServiceId = s.id;
          resolvedServiceSlug = s.slug;
        } else {
          const sByCat = await prisma.service.findFirst({
            where: {
              OR: [
                { title: category || existingProject.category },
                { slug: serviceSlug || '' },
              ],
            },
          }).catch(() => null);
          if (sByCat) {
            validServiceId = sByCat.id;
            resolvedServiceSlug = sByCat.slug;
          } else {
            validServiceId = null;
          }
        }
      } else {
        validServiceId = null;
        resolvedServiceSlug = null;
      }
    }

    const persistentCoverImage = coverImage !== undefined
      ? saveBase64Image(coverImage, title || existingProject.title)
      : undefined;

    const updatedProject = await prisma.project.update({
      where: { id: targetId },
      data: {
        title: title !== undefined ? title.trim() : undefined,
        slug: finalSlug,
        category: category !== undefined ? category.trim() : undefined,
        serviceId: validServiceId,
        serviceSlug: resolvedServiceSlug,
        client: client !== undefined ? (client ? client.trim() : null) : undefined,
        year: year !== undefined ? (year ? year.trim() : null) : undefined,
        summary: summary !== undefined ? summary.trim() : undefined,
        description: description !== undefined ? description.trim() : undefined,
        coverImage: persistentCoverImage,
        galleryImages: galleryImages !== undefined
          ? formatJsonField(Array.isArray(galleryImages) ? galleryImages.map((img) => saveBase64Image(img, title || existingProject.title)) : galleryImages)
          : undefined,
        liveUrl: liveUrl !== undefined ? (liveUrl || null) : undefined,
        githubUrl: githubUrl !== undefined ? (githubUrl || null) : undefined,
        figmaUrl: figmaUrl !== undefined ? (figmaUrl || null) : undefined,
        behanceUrl: behanceUrl !== undefined ? (behanceUrl || null) : undefined,
        dribbbleUrl: dribbbleUrl !== undefined ? (dribbbleUrl || null) : undefined,
        featured: featured !== undefined ? (featured === true || featured === 'true') : undefined,
        order: order !== undefined ? parseInt(order, 10) : undefined,
        tags: tags !== undefined ? formatJsonField(tags) : undefined,
        tools: tools !== undefined ? formatJsonField(tools) : undefined,
        challenges: challenges !== undefined ? challenges : undefined,
        solutions: solutions !== undefined ? solutions : undefined,
        results: results !== undefined ? results : undefined,
        goal: goal !== undefined ? goal : undefined,
        solution: solution !== undefined ? solution : undefined,
        seoTitle: seoTitle !== undefined ? seoTitle : undefined,
        seoDescription: seoDescription !== undefined ? seoDescription : undefined,
        altText: altText !== undefined ? altText : undefined,
        active: active !== undefined ? (active === true || active === 'true') : undefined,
      },
      include: {
        service: true,
      },
    });

    // Invalidate distributed cache & trigger persistent snapshot
    cacheService.invalidateTags(['projects', 'homepage', 'services']);
    backupService.triggerDebouncedSnapshot(prisma, 1000);

    return successResponse(res, formatProject(updatedProject), 'Project updated successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Delete project
 * DELETE /api/admin/projects/:id
 */
const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return errorResponse(res, 'Project not found.', 404);
    }

    await prisma.project.delete({ where: { id } });
    cacheService.invalidateTags(['projects', 'homepage', 'services']);
    backupService.triggerDebouncedSnapshot(prisma, 1000);

    return successResponse(res, null, 'Project deleted successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Reorder projects in batch
 * POST /api/admin/projects/reorder
 */
const reorderProjects = async (req, res, next) => {
  try {
    const { orders } = req.body; // Array of { id, order }

    if (!Array.isArray(orders)) {
      return errorResponse(res, 'Orders must be an array of { id, order } objects.', 400);
    }

    const updates = orders.map((item) =>
      prisma.project.update({
        where: { id: item.id },
        data: { order: item.order },
      })
    );

    await prisma.$transaction(updates);
    cacheService.invalidateTags(['projects', 'homepage', 'services']);
    backupService.triggerDebouncedSnapshot(prisma, 1000);

    return successResponse(res, null, 'Projects reordered successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPublicProjects,
  getProjectBySlug,
  getAllProjectsAdmin,
  createProject,
  updateProject,
  deleteProject,
  reorderProjects,
};
