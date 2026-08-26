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
    galleryImages: parseJsonField(project.galleryImages),
  };
};

/**
 * Public: Get all active projects with optional filters
 * GET /api/projects
 */
const getPublicProjects = async (req, res, next) => {
  try {
    const { category, featured, search, limit } = req.query;

    const where = { active: true };

    if (category && category !== 'All') {
      where.category = category;
    }

    if (featured === 'true') {
      where.featured = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { summary: { contains: search } },
        { client: { contains: search } },
      ];
    }

    const projects = await prisma.project.findMany({
      where,
      orderBy: [{ featured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
      take: limit ? parseInt(limit, 10) : undefined,
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
    });

    if (!project || (!project.active && (!req.user || req.user.role !== 'ADMIN'))) {
      return errorResponse(res, 'Project not found.', 404);
    }

    // Get related projects from the same category
    const relatedProjects = await prisma.project.findMany({
      where: {
        category: project.category,
        id: { not: project.id },
        active: true,
      },
      take: 3,
      orderBy: { order: 'asc' },
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
      challenges,
      solutions,
      results,
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

    const newProject = await prisma.project.create({
      data: {
        title: title.trim(),
        slug: uniqueSlug,
        category: category.trim(),
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
        challenges: challenges || null,
        solutions: solutions || null,
        results: results || null,
        active: active !== undefined ? Boolean(active) : true,
      },
    });

    return successResponse(res, formatProject(newProject), 'Project created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Update project
 * PUT /api/admin/projects/:id
 */
const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      category,
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
      challenges,
      solutions,
      results,
      active,
    } = req.body;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return errorResponse(res, 'Project not found.', 404);
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (slug !== undefined) updateData.slug = generateSlug(slug);
    if (category !== undefined) updateData.category = category.trim();
    if (client !== undefined) updateData.client = client;
    if (year !== undefined) updateData.year = year;
    if (summary !== undefined) updateData.summary = summary;
    if (description !== undefined) updateData.description = description;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (galleryImages !== undefined) updateData.galleryImages = formatJsonField(galleryImages);
    if (liveUrl !== undefined) updateData.liveUrl = liveUrl;
    if (githubUrl !== undefined) updateData.githubUrl = githubUrl;
    if (figmaUrl !== undefined) updateData.figmaUrl = figmaUrl;
    if (behanceUrl !== undefined) updateData.behanceUrl = behanceUrl;
    if (dribbbleUrl !== undefined) updateData.dribbbleUrl = dribbbleUrl;
    if (featured !== undefined) updateData.featured = Boolean(featured);
    if (order !== undefined) updateData.order = parseInt(order, 10);
    if (tags !== undefined) updateData.tags = formatJsonField(tags);
    if (challenges !== undefined) updateData.challenges = challenges;
    if (solutions !== undefined) updateData.solutions = solutions;
    if (results !== undefined) updateData.results = results;
    if (active !== undefined) updateData.active = Boolean(active);

    const updated = await prisma.project.update({
      where: { id },
      data: updateData,
    });

    return successResponse(res, formatProject(updated), 'Project updated successfully.');
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
    await prisma.project.delete({ where: { id } });
    return successResponse(res, null, 'Project deleted successfully.');
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
};
