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

    const backupService = require('../services/backupService');

    if (req.file) {
      const media = await mediaService.processUpload(req.file, altText);
      backupService.triggerDebouncedSnapshot(prisma, 500);
      return successResponse(res, formatMedia(media), 'File uploaded successfully to Media Library.', 201);
    }

    if (req.files && req.files.length > 0) {
      const results = [];
      for (const file of req.files) {
        const item = await mediaService.processUpload(file, altText);
        results.push(formatMedia(item));
      }
      backupService.triggerDebouncedSnapshot(prisma, 500);
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

    // PERF-01: Enrich all media assets in a single batch query pass (eliminates N+1 query problem)
    const usageMap = await mediaService.getBatchMediaUsage(mediaItems || []);
    const enrichedItems = (mediaItems || []).map((m) => {
      const usage = usageMap.get(m.id) || { usageCount: 0, usedIn: [] };
      return formatMedia(m, usage);
    });

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

/**
 * Admin: Optimize single media asset to WebP / SVG
 * POST /api/admin/media/:id/optimize
 */
const optimizeMedia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { dataUrl, targetFormat, quality } = req.body;
    const result = await mediaService.optimizeMediaItem(id, { dataUrl, targetFormat, quality });
    return successResponse(res, result, 'Media asset optimized successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Get storage status (Cloudinary vs Local disk)
 * GET /api/admin/media/storage-status
 */
const getStorageStatus = async (req, res, next) => {
  try {
    const { isConfigured, cloudName } = await mediaService.getCloudinaryClient();
    const totalMedia = await prisma.media.count();
    const cloudinaryCount = await prisma.media.count({ where: { source: 'CLOUDINARY' } });
    const localCount = await prisma.media.count({ where: { source: 'LOCAL' } });

    return successResponse(res, {
      engine: isConfigured ? 'CLOUDINARY' : 'LOCAL',
      isPermanentCloud: isConfigured,
      cloudName: cloudName || null,
      counts: {
        total: totalMedia,
        cloudinary: cloudinaryCount,
        local: localCount,
      },
    }, 'Storage status retrieved.');
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Test Cloudinary Connection
 * POST /api/admin/media/test-cloudinary
 */
const testCloudinary = async (req, res, next) => {
  try {
    const { cloudName, apiKey, apiSecret } = req.body;
    const c = require('cloudinary').v2;
    c.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    const ping = await c.api.ping();
    if (ping?.status === 'ok') {
      // Save credentials to SiteSetting
      await prisma.siteSetting.upsert({
        where: { key: 'cloudinary_cloud_name' },
        update: { value: cloudName },
        create: { key: 'cloudinary_cloud_name', value: cloudName },
      });
      await prisma.siteSetting.upsert({
        where: { key: 'cloudinary_api_key' },
        update: { value: apiKey },
        create: { key: 'cloudinary_api_key', value: apiKey },
      });
      await prisma.siteSetting.upsert({
        where: { key: 'cloudinary_api_secret' },
        update: { value: apiSecret },
        create: { key: 'cloudinary_api_secret', value: apiSecret },
      });

      return successResponse(res, { connected: true }, 'Cloudinary connected and saved successfully!');
    }
    return errorResponse(res, 'Could not authenticate with Cloudinary. Please check your credentials.', 400);
  } catch (err) {
    return errorResponse(res, `Cloudinary connection failed: ${err.message}`, 400);
  }
};

/**
 * Admin: Migrate all local disk images to Cloudinary
 * POST /api/admin/media/migrate-cloudinary
 */
const migrateCloudinary = async (req, res, next) => {
  try {
    const result = await mediaService.migrateLocalImagesToCloudinary();
    return successResponse(
      res,
      result,
      `Migration complete! ${result.migrated} out of ${result.total} images uploaded to Cloudinary CDN.`
    );
  } catch (err) {
    return errorResponse(res, err.message || 'Migration failed.', 500);
  }
};

module.exports = {
  uploadMedia,
  scanExistingMedia,
  getMediaUsage,
  getAllMediaAdmin,
  updateMedia,
  deleteMedia,
  optimizeMedia,
  getStorageStatus,
  testCloudinary,
  migrateCloudinary,
};
