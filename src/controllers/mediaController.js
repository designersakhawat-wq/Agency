const prisma = require('../config/db');
const mediaService = require('../services/mediaService');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');

const formatMedia = (m, usage = { usageCount: 0, usedIn: [] }) => {
  if (!m) return null;
  return {
    ...m,
    url: m.fileUrl,
    usageCount: usage.usageCount || 0,
    usedIn: usage.usedIn || [],
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
      return successResponse(res, formatMedia(media), 'File uploaded successfully to Media Library.', 201);
    }

    if (req.files && req.files.length > 0) {
      const results = [];
      for (const file of req.files) {
        const item = await mediaService.processUpload(file, altText);
        results.push(formatMedia(item));
      }
      return successResponse(res, results, 'Files uploaded successfully to Media Library.', 201);
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Trigger Auto-Scan of all website images
 * POST /api/admin/media/scan
 */
const scanExistingMedia = async (req, res, next) => {
  try {
    const result = await mediaService.scanAndRegisterAllExistingImages();
    return successResponse(
      res,
      result,
      `Auto-scan complete. All website image assets have been discovered and synchronized.`
    );
  } catch (err) {
    console.error('Scan error:', err);
    return errorResponse(res, 'Failed to complete media auto-scan.', 500);
  }
};

/**
 * Admin: Get specific media usage details
 * GET /api/admin/media/:id/usage
 */
const getMediaUsage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) {
      return errorResponse(res, 'Media asset not found.', 404);
    }

    const usage = await mediaService.getMediaUsage(media.id, media.fileUrl);
    return successResponse(res, usage, 'Media usage references retrieved.');
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Get all media assets with enriched usage counts
 * GET /api/admin/media
 */
const getAllMediaAdmin = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, source, search } = req.query;
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

    // Enrich each media asset with usage count
    const enrichedItems = await Promise.all(
      (mediaItems || []).map(async (m) => {
        const usage = await mediaService.getMediaUsage(m.id, m.fileUrl);
        return formatMedia(m, usage);
      })
    );

    return paginatedResponse(
      res,
      enrichedItems,
      total || 0,
      parseInt(page, 10),
      parseInt(limit, 10),
      'Media assets retrieved.'
    );
  } catch (err) {
    return paginatedResponse(res, [], 0, 1, 50, 'Fallback media assets.');
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

    const usage = await mediaService.getMediaUsage(updated.id, updated.fileUrl);
    return successResponse(res, formatMedia(updated, usage), 'Media updated successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Delete media asset and cascade unlink globally
 * DELETE /api/admin/media/:id
 */
const deleteMedia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await mediaService.deleteMedia(id);
    if (!result) {
      return errorResponse(res, 'Media asset not found.', 404);
    }

    return successResponse(
      res,
      result,
      `Media asset deleted successfully and globally unlinked from ${result.unlinkedCount || 0} locations.`
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadMedia,
  scanExistingMedia,
  getMediaUsage,
  getAllMediaAdmin,
  updateMedia,
  deleteMedia,
};
