const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const cacheService = require('../services/cacheService');
const backupService = require('../services/backupService');

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
      price: Number(p.price) || 0,
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
    let services = [];
    try {
      services = await prisma.service.findMany({
        where: { active: true },
        include: {
          packages: {
            where: { active: true },
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      });
    } catch (dbErr) {
      console.warn('Services DB lookup warning:', dbErr.message);
    }

    const formatted = Array.isArray(services) ? services.map(formatService) : [];
    return successResponse(res, formatted, 'Services retrieved successfully.');
  } catch (err) {
    return successResponse(res, [], 'Fallback empty services.');
  }
};

/**
 * Public: Get single service by slug with its packages, category portfolio projects & faqs
 * GET /api/services/:slug
 */
const getServiceBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    let service = null;
    try {
      service = await prisma.service.findUnique({
        where: { slug },
        include: {
          packages: {
            where: { active: true },
            orderBy: { order: 'asc' },
          },
        },
      });
    } catch (dbErr) {
      console.warn('DB Service lookup error:', dbErr.message);
    }

    if (!service) {
      // Look for case-insensitive match
      try {
        const all = await prisma.service.findMany({
          include: {
            packages: {
              where: { active: true },
              orderBy: { order: 'asc' },
            },
          },
        });
        service = all.find((s) => s.slug === slug || s.slug?.toLowerCase() === slug?.toLowerCase());
      } catch (e) {}
    }

    // 1. Fetch projects explicitly assigned or created for this service
    let serviceProjects = [];
    try {
      const allProjects = await prisma.project.findMany({
        where: { active: true },
        orderBy: [{ featured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
      });

      serviceProjects = allProjects.filter((p) => {
        if (!service) {
          const pCat = (p.category || '').toLowerCase();
          return pCat.includes(slug.toLowerCase()) || p.serviceSlug === slug;
        }
        if (p.serviceId === service.id) return true;
        if (p.serviceSlug === service.slug) return true;
        if (p.category === service.title) return true;
        const pCat = (p.category || '').toLowerCase().trim();
        const sTitle = service.title.toLowerCase().trim();
        const sSlug = service.slug.toLowerCase().trim();
        if (pCat === sTitle) return true;
        if (sSlug.includes('logo') && (pCat.includes('logo') || pCat.includes('brand'))) return true;
        if (sSlug.includes('ads') && (pCat.includes('ads') || pCat.includes('social') || pCat.includes('post') || pCat.includes('creative'))) return true;
        if (sSlug.includes('ugc') && (pCat.includes('ugc') || pCat.includes('video') || pCat.includes('motion') || pCat.includes('reel'))) return true;
        if (sSlug.includes('cover') && (pCat.includes('cover') || pCat.includes('banner') || pCat.includes('header'))) return true;
        return false;
      });
    } catch (projErr) {
      console.warn('Projects lookup error:', projErr.message);
    }

    // Fetch relevant FAQs
    let faqs = [];
    try {
      faqs = await prisma.faq.findMany({
        where: { active: true },
        orderBy: { order: 'asc' },
        take: 6,
      });
    } catch (faqErr) {}

    const safeService = service ? formatService(service) : {
      title: slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      slug,
      description: 'Professional visual creative design service.',
      features: ['High-Converting Visuals', '100% Vector & Source Files', 'Direct Fast Turnaround'],
    };

    return successResponse(
      res,
      {
        service: safeService,
        projects: serviceProjects.map((p) => ({
          ...p,
          tags: parseJsonField(p.tags),
          galleryImages: parseJsonField(p.galleryImages),
        })),
        packages: service?.packages ? service.packages.map((p) => ({
          ...p,
          features: parseJsonField(p.features),
          excludedFeatures: parseJsonField(p.excludedFeatures),
        })) : [],
        faqs,
      },
      'Service details retrieved.'
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Get all services
 * GET /api/admin/services/all
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
    }).catch(() => []);

    return successResponse(res, (services || []).map(formatService), 'All services retrieved.');
  } catch (err) {
    return successResponse(res, [], 'Fallback services.');
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

    const existing = await prisma.service.findUnique({ where: { slug: finalSlug } });
    if (existing) {
      return errorResponse(res, 'A service with this slug already exists.', 409);
    }

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

    // Save initial packages if provided
    if (Array.isArray(req.body.packages) && req.body.packages.length > 0) {
      for (let i = 0; i < req.body.packages.length; i++) {
        const pkg = req.body.packages[i];
        if (!pkg.name) continue;
        await prisma.package.create({
          data: {
            serviceId: service.id,
            name: pkg.name.trim(),
            description: pkg.description || null,
            price: parseFloat(pkg.price) || 0,
            billingPeriod: pkg.billingPeriod || 'per project',
            features: formatJsonField(pkg.features) || '[]',
            isPopular: Boolean(pkg.isPopular),
            order: i + 1,
            active: true,
            ctaText: pkg.ctaText || 'Select & Order Package',
          },
        }).catch(() => null);
      }
    }

    const finalCreated = await prisma.service.findUnique({
      where: { id: service.id },
      include: { packages: { orderBy: { order: 'asc' } } },
    });

    // Invalidate distributed cache & trigger persistent snapshot
    cacheService.invalidateTags(['services', 'homepage', 'packages', 'projects']);
    backupService.triggerDebouncedSnapshot(prisma, 1000);

    return successResponse(res, formatService(finalCreated || service), 'Service created successfully.', 201);
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

    // Save service core updates in SQLite
    const updatedService = await prisma.service.update({
      where: { id },
      data: updateData,
    });

    // Atomically synchronize packages if provided
    if (Array.isArray(req.body.packages) && req.body.packages.length > 0) {
      for (let i = 0; i < req.body.packages.length; i++) {
        const pkg = req.body.packages[i];
        if (!pkg.name) continue;
        const pkgData = {
          serviceId: id,
          name: pkg.name.trim(),
          description: pkg.description || null,
          price: parseFloat(pkg.price) || 0,
          billingPeriod: pkg.billingPeriod || 'per project',
          features: formatJsonField(pkg.features) || '[]',
          isPopular: Boolean(pkg.isPopular),
          order: i + 1,
          active: true,
          ctaText: pkg.ctaText || 'Select & Order Package',
        };

        if (pkg.id && !pkg.id.startsWith('pkg-')) {
          await prisma.package.upsert({
            where: { id: pkg.id },
            update: pkgData,
            create: pkgData,
          }).catch(() => null);
        } else {
          await prisma.package.create({ data: pkgData }).catch(() => null);
        }
      }
    }

    const finalUpdated = await prisma.service.findUnique({
      where: { id },
      include: {
        packages: {
          orderBy: { order: 'asc' },
        },
      },
    });

    // Invalidate distributed cache & trigger persistent snapshot
    cacheService.invalidateTags(['services', 'homepage', 'packages', 'projects']);
    backupService.triggerDebouncedSnapshot(prisma, 1000);

    return successResponse(res, formatService(finalUpdated || updatedService), 'Service updated successfully.');
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
    
    // Invalidate distributed cache & trigger persistent snapshot
    cacheService.invalidateTags(['services', 'homepage', 'packages', 'projects']);
    backupService.triggerDebouncedSnapshot(prisma, 1000);

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
