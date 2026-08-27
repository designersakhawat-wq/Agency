const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const parseJsonField = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'object') return val;
  try { return JSON.parse(val); } catch (e) { return []; }
};

const formatJsonField = (val) => {
  if (!val) return null;
  if (typeof val === 'string') return val;
  return JSON.stringify(val);
};

const formatService = (s) => {
  if (!s) return null;
  return {
    ...s,
    features: parseJsonField(s.features),
    deliverables: parseJsonField(s.deliverables),
    packages: s.packages ? s.packages.map((p) => ({
      ...p,
      features: parseJsonField(p.features),
      excludedFeatures: parseJsonField(p.excludedFeatures),
    })) : undefined,
  };
};

/**
 * Public: Get all active services with their pricing packages
 * GET /api/services
 */
const getPublicServices = async (req, res, next) => {
  try {
    const services = await prisma.service.findMany({
      where: { active: true },
      include: {
        packages: {
          where: { active: true },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    return successResponse(res, services.map(formatService), 'Services retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * Public: Get single service by slug with its packages, category portfolio projects & faqs
 * GET /api/services/:slug
 */
const getServiceBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const service = await prisma.service.findUnique({
      where: { slug },
      include: {
        packages: {
          where: { active: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!service || (!service.active && (!req.user || req.user.role !== 'ADMIN'))) {
      return errorResponse(res, 'Service not found.', 404);
    }

    // Fetch related portfolio projects for this service
    const relatedProjects = await prisma.project.findMany({
      where: {
        active: true,
        OR: [
          { serviceId: service.id },
          { serviceSlug: service.slug },
          { category: { contains: service.title } },
          { category: service.title },
          { title: { contains: service.title } },
        ],
      },
      take: 6,
      orderBy: [{ featured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
    });

    // Fallback: If no direct service match, fetch latest active projects
    const finalProjects = relatedProjects.length > 0
      ? relatedProjects
      : await prisma.project.findMany({ where: { active: true }, take: 4, orderBy: { order: 'asc' } });

    // Fetch relevant FAQs
    const faqs = await prisma.faq.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
      take: 6,
    });

    return successResponse(
      res,
      {
        service: formatService(service),
        projects: finalProjects.map((p) => ({
          ...p,
          tags: parseJsonField(p.tags),
          galleryImages: parseJsonField(p.galleryImages),
        })),
        faqs,
      },
      'Service details retrieved successfully.'
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Get all services
 * GET /api/admin/services
 */
const getAllServicesAdmin = async (req, res, next) => {
  try {
    const services = await prisma.service.findMany({
      include: {
        packages: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    return successResponse(res, services.map(formatService), 'All services retrieved.');
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Create service
 * POST /api/admin/services
 */
const createService = async (req, res, next) => {
  try {
    const { title, slug, tagline, description, icon, features, deliverables, order, active } = req.body;

    if (!title || !description) {
      return errorResponse(res, 'Title and description are required.', 400);
    }

    const finalSlug = slug ? generateSlug(slug) : generateSlug(title);

    const service = await prisma.service.create({
      data: {
        title: title.trim(),
        slug: finalSlug,
        tagline: tagline || null,
        description: description.trim(),
        icon: icon || 'Layout',
        features: formatJsonField(features),
        deliverables: formatJsonField(deliverables),
        order: order !== undefined ? parseInt(order, 10) : 0,
        active: active !== undefined ? Boolean(active) : true,
      },
    });

    return successResponse(res, formatService(service), 'Service created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Update service
 * PUT /api/admin/services/:id
 */
const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, slug, tagline, description, icon, features, deliverables, order, active } = req.body;

    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) {
      return errorResponse(res, 'Service not found.', 404);
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (slug !== undefined) updateData.slug = generateSlug(slug);
    if (tagline !== undefined) updateData.tagline = tagline;
    if (description !== undefined) updateData.description = description.trim();
    if (icon !== undefined) updateData.icon = icon;
    if (features !== undefined) updateData.features = formatJsonField(features);
    if (deliverables !== undefined) updateData.deliverables = formatJsonField(deliverables);
    if (order !== undefined) updateData.order = parseInt(order, 10);
    if (active !== undefined) updateData.active = Boolean(active);

    const updated = await prisma.service.update({
      where: { id },
      data: updateData,
    });

    return successResponse(res, formatService(updated), 'Service updated successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Delete service
 * DELETE /api/admin/services/:id
 */
const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.service.delete({ where: { id } });
    return successResponse(res, null, 'Service deleted successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPublicServices,
  getServiceBySlug,
  getAllServicesAdmin,
  createService,
  updateService,
  deleteService,
};
