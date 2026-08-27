const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/apiResponse');

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
 * GET /api/projects
 */
const getPublicProjects = async (req, res, next) => {
  try {
    const { category, serviceId, serviceSlug, featured, search, limit } = req.query;

    const where = { active: true };

    if (category && category !== 'All') {
      where.category = category;
    }

    if (serviceId) {
      where.serviceId = serviceId;
    } else if (serviceSlug) {
      where.serviceSlug = serviceSlug;
    }

    if (featured === 'true') {
      where.featured = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { summary: { contains: search } },
        { client: { contains: search } },
        { category: { contains: search } },
      ];
    }

    const projects = await prisma.project.findMany({
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

    const formatted = projects.map(formatProject);
    return successResponse(res, formatted, 'Projects retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * Public: Get single project by slug
 * GET /api/projects/:slug
 */
const getProjectBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const project = await prisma.project.findUnique({
      where: { slug },
      include: {
        service: true,
      },
    });

    if (!project || (!project.active && (!req.user || req.user.role !== 'ADMIN'))) {
      return errorResponse(res, 'Project not found.', 404);
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

    return successResponse(
      res,
      {
        project: formatProject(project),
        relatedProjects: relatedProjects.map(formatProject),
      },
      'Project details retrieved.'
    );
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
    });

    return successResponse(res, projects.map(formatProject), 'All admin projects retrieved.');
  } catch (err) {
    next(err);
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

    if (!title || !category || !summary || !description || !coverImage) {
      return errorResponse(
        res,
        'Please provide title, category, summary, description, and cover image.',
        400
      );
    }

    const finalSlug = slug ? generateSlug(slug) : generateSlug(title);

    // Verify slug uniqueness
    const existing = await prisma.project.findUnique({ where: { slug: finalSlug } });
    const uniqueSlug = existing ? `${finalSlug}-${Date.now()}` : finalSlug;

    // Resolve serviceSlug if serviceId is provided
    let resolvedServiceSlug = serviceSlug || null;
    if (serviceId && !resolvedServiceSlug) {
      const s = await prisma.service.findUnique({ where: { id: serviceId } });
      if (s) resolvedServiceSlug = s.slug;
    }

    const newProject = await prisma.project.create({
      data: {
        title: title.trim(),
        slug: uniqueSlug,
        category: category.trim(),
        serviceId: serviceId || null,
        serviceSlug: resolvedServiceSlug,
        client: client ? client.trim() : null,
        year: year ? year.trim() : new Date().getFullYear().toString(),
        summary: summary.trim(),
        description: description.trim(),
        coverImage,
        galleryImages: formatJsonField(galleryImages),
        liveUrl: liveUrl || null,
        githubUrl: githubUrl || null,
        figmaUrl: figmaUrl || null,
        behanceUrl: behanceUrl || null,
        dribbbleUrl: dribbbleUrl || null,
        featured: featured === true || featured === 'true',
        order: order ? parseInt(order, 10) : 0,
        tags: formatJsonField(tags),
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

    const existingProject = await prisma.project.findUnique({ where: { id } });
    if (!existingProject) {
      return errorResponse(res, 'Project not found.', 404);
    }

    let finalSlug = existingProject.slug;
    if (slug && slug !== existingProject.slug) {
      finalSlug = generateSlug(slug);
      const duplicate = await prisma.project.findUnique({ where: { slug: finalSlug } });
      if (duplicate && duplicate.id !== id) {
        return errorResponse(res, 'A project with this URL slug already exists.', 409);
      }
    }

    // Resolve serviceSlug if serviceId is provided
    let resolvedServiceSlug = serviceSlug !== undefined ? serviceSlug : existingProject.serviceSlug;
    if (serviceId && serviceId !== existingProject.serviceId) {
      const s = await prisma.service.findUnique({ where: { id: serviceId } });
      if (s) resolvedServiceSlug = s.slug;
    } else if (serviceId === null || serviceId === '') {
      resolvedServiceSlug = null;
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : undefined,
        slug: finalSlug,
        category: category !== undefined ? category.trim() : undefined,
        serviceId: serviceId !== undefined ? (serviceId || null) : undefined,
        serviceSlug: resolvedServiceSlug,
        client: client !== undefined ? (client ? client.trim() : null) : undefined,
        year: year !== undefined ? (year ? year.trim() : null) : undefined,
        summary: summary !== undefined ? summary.trim() : undefined,
        description: description !== undefined ? description.trim() : undefined,
        coverImage: coverImage !== undefined ? coverImage : undefined,
        galleryImages: galleryImages !== undefined ? formatJsonField(galleryImages) : undefined,
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
