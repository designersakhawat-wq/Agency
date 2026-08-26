const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// CLIENT BRANDS
const getPublicBrands = async (req, res, next) => {
  try {
    const brands = await prisma.clientBrand.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    });
    return successResponse(res, brands, 'Client brands retrieved.');
  } catch (err) {
    next(err);
  }
};

const getAllBrandsAdmin = async (req, res, next) => {
  try {
    const brands = await prisma.clientBrand.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
    return successResponse(res, brands, 'All client brands retrieved.');
  } catch (err) {
    next(err);
  }
};

const createBrand = async (req, res, next) => {
  try {
    const { name, logoUrl, websiteUrl, order, active } = req.body;
    if (!name || !logoUrl) {
      return errorResponse(res, 'Brand name and logo URL are required.', 400);
    }

    const brand = await prisma.clientBrand.create({
      data: {
        name: name.trim(),
        logoUrl,
        websiteUrl: websiteUrl || null,
        order: order !== undefined ? parseInt(order, 10) : 0,
        active: active !== undefined ? Boolean(active) : true,
      },
    });

    return successResponse(res, brand, 'Brand created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

const updateBrand = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, logoUrl, websiteUrl, order, active } = req.body;

    const brand = await prisma.clientBrand.findUnique({ where: { id } });
    if (!brand) return errorResponse(res, 'Brand not found.', 404);

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
    if (websiteUrl !== undefined) updateData.websiteUrl = websiteUrl;
    if (order !== undefined) updateData.order = parseInt(order, 10);
    if (active !== undefined) updateData.active = Boolean(active);

    const updated = await prisma.clientBrand.update({ where: { id }, data: updateData });
    return successResponse(res, updated, 'Brand updated successfully.');
  } catch (err) {
    next(err);
  }
};

const deleteBrand = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.clientBrand.delete({ where: { id } });
    return successResponse(res, null, 'Brand deleted successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPublicBrands,
  getAllBrandsAdmin,
  createBrand,
  updateBrand,
  deleteBrand,
};
