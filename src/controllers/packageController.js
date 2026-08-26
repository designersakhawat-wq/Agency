const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/apiResponse');

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

const formatPackage = (p) => {
  if (!p) return null;
  return {
    ...p,
    features: parseJsonField(p.features),
    excludedFeatures: parseJsonField(p.excludedFeatures),
  };
};

/**
 * Public: Get all active pricing packages
 * GET /api/packages
 */
const getPublicPackages = async (req, res, next) => {
  try {
    const packages = await prisma.package.findMany({
      where: { active: true },
      include: { service: { select: { id: true, title: true, slug: true } } },
      orderBy: [{ isPopular: 'desc' }, { order: 'asc' }],
    });

    return successResponse(res, packages.map(formatPackage), 'Pricing packages retrieved.');
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Get all packages
 * GET /api/admin/packages
 */
const getAllPackagesAdmin = async (req, res, next) => {
  try {
    const packages = await prisma.package.findMany({
      include: { service: { select: { id: true, title: true } } },
      orderBy: [{ order: 'asc' }],
    });

    return successResponse(res, packages.map(formatPackage), 'All packages retrieved.');
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Create Package
 * POST /api/admin/packages
 */
const createPackage = async (req, res, next) => {
  try {
    const {
      serviceId,
      name,
      description,
      price,
      billingPeriod,
      features,
      excludedFeatures,
      isPopular,
      order,
      active,
      ctaText,
    } = req.body;

    if (!name || price === undefined) {
      return errorResponse(res, 'Name and price are required.', 400);
    }

    const pkg = await prisma.package.create({
      data: {
        serviceId: serviceId || null,
        name: name.trim(),
        description: description || null,
        price: parseFloat(price),
        billingPeriod: billingPeriod || 'one-time',
        features: formatJsonField(features) || '[]',
        excludedFeatures: formatJsonField(excludedFeatures),
        isPopular: Boolean(isPopular),
        order: order !== undefined ? parseInt(order, 10) : 0,
        active: active !== undefined ? Boolean(active) : true,
        ctaText: ctaText || 'Book Package',
      },
    });

    return successResponse(res, formatPackage(pkg), 'Package created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Update Package
 * PUT /api/admin/packages/:id
 */
const updatePackage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      serviceId,
      name,
      description,
      price,
      billingPeriod,
      features,
      excludedFeatures,
      isPopular,
      order,
      active,
      ctaText,
    } = req.body;

    const pkg = await prisma.package.findUnique({ where: { id } });
    if (!pkg) {
      return errorResponse(res, 'Package not found.', 404);
    }

    const updateData = {};
    if (serviceId !== undefined) updateData.serviceId = serviceId || null;
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (billingPeriod !== undefined) updateData.billingPeriod = billingPeriod;
    if (features !== undefined) updateData.features = formatJsonField(features);
    if (excludedFeatures !== undefined) updateData.excludedFeatures = formatJsonField(excludedFeatures);
    if (isPopular !== undefined) updateData.isPopular = Boolean(isPopular);
    if (order !== undefined) updateData.order = parseInt(order, 10);
    if (active !== undefined) updateData.active = Boolean(active);
    if (ctaText !== undefined) updateData.ctaText = ctaText;

    const updated = await prisma.package.update({
      where: { id },
      data: updateData,
    });

    return successResponse(res, formatPackage(updated), 'Package updated successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Delete Package
 * DELETE /api/admin/packages/:id
 */
const deletePackage = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.package.delete({ where: { id } });
    return successResponse(res, null, 'Package deleted successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPublicPackages,
  getAllPackagesAdmin,
  createPackage,
  updatePackage,
  deletePackage,
};
