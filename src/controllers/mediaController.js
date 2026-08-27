const prisma = require('../config/db');
const mediaService = require('../services/mediaService');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');

const formatMedia = (m) => {
  if (!m) return null;
  return {
    ...m,
    url: m.fileUrl,
  };
};

/**
 * Admin: Upload single or multiple files
 * POST /api/admin/media/upload
 */
const uploadMedia = async (req, res, next) => {
  try {
    if (!req.file && (!req.files || req.files.length === 0)) {
      return errorResponse(res, 'No files were uploaded.', 400);
    }

    const { altText } = req.body;

    if (req.file) {
      const media = await mediaService.processUpload(req.file, altText);
      return successResponse(res, formatMedia(media), 'File uploaded successfully.', 201);
    }

    if (req.files && req.files.length > 0) {
      const results = [];
      for (const file of req.files) {
        const item = await mediaService.processUpload(file, altText);
        results.push(formatMedia(item));
      }
      return successResponse(res, results, 'Files uploaded successfully.', 201);
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Get all media assets
 * GET /api/admin/media
 */
const getAllMediaAdmin = async (req, res, next) => {
  try {
    const { page = 1, limit = 30, source, search } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const where = {};
    if (source && source !== 'ALL') where.source = source;
    if (search) {
      where.OR = [
        { fileName: { contains: search } },
        { altText: { contains: search } },
      ];
    }

    const [mediaItems, total] = await Promise.all([
      prisma.media.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }).catch(() => []),
      prisma.media.count({ where }).catch(() => 0),
    ]);

    return paginatedResponse(
      res,
      (mediaItems || []).map(formatMedia),
      total || 0,
      parseInt(page, 10),
      parseInt(limit, 10),
      'Media assets retrieved.'
    );
  } catch (err) {
    return paginatedResponse(res, [], 0, 1, 30, 'Fallback media assets.');
  }
};

/**
 * Admin: Update media asset metadata
 * PUT /api/admin/media/:id
 */
const updateMedia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { altText } = req.body;

    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) {
      return errorResponse(res, 'Media asset not found.', 404);
    }

    const updated = await prisma.media.update({
      where: { id },
      data: {
        altText: altText !== undefined ? altText : media.altText,
      },
    });

    return successResponse(res, formatMedia(updated), 'Media updated successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Delete media asset
 * DELETE /api/admin/media/:id
 */
const deleteMedia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await mediaService.deleteMedia(id);
    if (!deleted) {
      return errorResponse(res, 'Media asset not found.', 404);
    }

    return successResponse(res, null, 'Media deleted successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadMedia,
  getAllMediaAdmin,
  updateMedia,
  deleteMedia,
};
