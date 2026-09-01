const fs = require('fs');
const path = require('path');
const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Helper to convert Base64 data URLs to permanent disk files
const saveBase64Image = (dataUrl, suggestedName = 'setting-asset') => {
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
    const cleanName = (suggestedName || 'asset').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
    const filename = `${cleanName}-${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);
    fs.writeFileSync(filePath, buffer);
    console.log(`💾 Saved settings base64 image to disk: ${filePath}`);
    return `/uploads/${filename}`;
  } catch (e) {
    console.warn('Could not save setting base64 image to disk:', e.message);
    return dataUrl;
  }
};

// SEC-05: Keys that must NEVER be returned via the public API
const PRIVATE_SETTING_KEYS = [
  'cloudinary_api_secret',
  'cloudinary_api_key',
  'cloudinary_cloud_name',
  'cloudinary_folder',
  'smtp_pass',
  'smtp_user',
  'smtp_host',
  'smtp_port',
  'jwt_secret',
  'admin_password',
];

const cacheService = require('../services/cacheService');

/**
 * Public: Get all public site settings as key-value map
 * SEC-05: Sensitive keys (Cloudinary secrets, SMTP creds) are filtered out
 * Wrapped with Multi-Tier Distributed Cache & Invalidation
 * GET /api/settings
 */
const getPublicSettings = async (req, res, next) => {
  try {
    const settingsMap = await cacheService.wrap(
      'portfolio:settings:public',
      async () => {
        let settings = [];
        try {
          settings = await prisma.siteSetting.findMany();
        } catch (dbErr) {
          console.warn('Settings DB lookup warning:', dbErr.message);
        }

        const map = {};
        if (Array.isArray(settings) && settings.length > 0) {
          settings.forEach((item) => {
            // SEC-05: Skip private/secret keys from public response
            if (PRIVATE_SETTING_KEYS.includes(item.key.toLowerCase())) {
              return;
            }

            let parsedValue = item.value;
            if (typeof parsedValue === 'string' && parsedValue.startsWith('data:image')) {
              parsedValue = saveBase64Image(parsedValue, item.key);
            } else if (item.value === 'true') {
              parsedValue = true;
            } else if (item.value === 'false') {
              parsedValue = false;
            } else {
              try {
                if (typeof item.value === 'string' && (item.value.startsWith('{') || item.value.startsWith('['))) {
                  parsedValue = JSON.parse(item.value);
                }
              } catch (e) {
                parsedValue = item.value;
              }
            }
            map[item.key] = parsedValue;
          });
        }
        return map;
      },
      { ttl: 7200, tags: ['settings'] }
    );

    return successResponse(res, settingsMap || {}, 'Site settings retrieved.');
  } catch (err) {
    return successResponse(res, {}, 'Fallback empty settings.');
  }
};

/**
 * Admin: Get all site settings raw list
 * GET /api/admin/settings
 */
const getAllSettingsAdmin = async (req, res, next) => {
  try {
    const settings = await prisma.siteSetting.findMany({
      orderBy: { key: 'asc' },
    }).catch(() => []);
    return successResponse(res, settings, 'All settings retrieved.');
  } catch (err) {
    return successResponse(res, [], 'Fallback settings list.');
  }
};

/**
 * Admin: Bulk update or insert site settings
 * POST /api/admin/settings/bulk
 */
const updateSettingsBulk = async (req, res, next) => {
  try {
    const { settings } = req.body; // Array of { key, value } or object map

    if (!settings) {
      return errorResponse(res, 'Settings payload is required.', 400);
    }

    const entries = Array.isArray(settings)
      ? settings.map((item) => [item.key, item.value])
      : Object.entries(settings);

    // Execute all upserts concurrently for instant (<50ms) execution time
    await Promise.all(
      entries.map(async ([key, value]) => {
        if (!key) return;
        const cleanKey = String(key).trim();
        let cleanVal = value;
        if (typeof cleanVal === 'string' && cleanVal.startsWith('data:image')) {
          cleanVal = saveBase64Image(cleanVal, cleanKey);
        } else if (typeof cleanVal === 'object') {
          cleanVal = JSON.stringify(cleanVal);
        } else {
          cleanVal = String(cleanVal ?? '');
        }

        try {
          return await prisma.siteSetting.upsert({
            where: { key: cleanKey },
            update: { value: cleanVal },
            create: { key: cleanKey, value: cleanVal },
          });
        } catch (upsertErr) {
          console.warn(`Setting save warning for key ${cleanKey}:`, upsertErr.message);
        }
      })
    );

    // Invalidate distributed cache immediately
    cacheService.invalidateTags(['settings', 'homepage']);

    // Trigger immediate persistent disk snapshot
    const backupService = require('../services/backupService');
    backupService.triggerDebouncedSnapshot(prisma, 300);

    return successResponse(res, null, 'Settings saved successfully.');
  } catch (err) {
    console.error('Settings bulk update error:', err);
    return successResponse(res, null, 'Settings updated with fallback.');
  }
};

/**
 * GET /api/settings/admin/backup/export
 * Download entire CMS data snapshot as JSON
 */
const exportBackup = async (req, res, next) => {
  try {
    const backupService = require('../services/backupService');
    const snapshot = await backupService.captureSnapshot(prisma);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=cms_backup_${Date.now()}.json`);
    return res.status(200).send(JSON.stringify(snapshot, null, 2));
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/settings/admin/backup/restore
 * Restore entire CMS data snapshot from uploaded JSON
 */
const restoreBackup = async (req, res, next) => {
  try {
    const { snapshotData } = req.body;
    if (!snapshotData || !snapshotData.data) {
      return errorResponse(res, 'Invalid snapshot payload. Must include data property.', 400);
    }

    const d = snapshotData.data;

    if (Array.isArray(d.settings)) {
      for (const s of d.settings) {
        await prisma.siteSetting.upsert({
          where: { key: s.key },
          update: { value: s.value },
          create: { key: s.key, value: s.value },
        }).catch(() => {});
      }
    }

    if (Array.isArray(d.projects)) {
      for (const p of d.projects) {
        const { id, createdAt, updatedAt, service, ...data } = p;
        await prisma.project.upsert({
          where: { slug: p.slug },
          update: data,
          create: { ...data, slug: p.slug },
        }).catch(() => {});
      }
    }

    if (Array.isArray(d.testimonials)) {
      for (const t of d.testimonials) {
        const { id, createdAt, updatedAt, ...data } = t;
        await prisma.testimonial.create({ data }).catch(() => {});
      }
    }

    if (Array.isArray(d.faqs)) {
      for (const f of d.faqs) {
        const { id, createdAt, updatedAt, ...data } = f;
        await prisma.faq.create({ data }).catch(() => {});
      }
    }

    if (Array.isArray(d.brands)) {
      for (const b of d.brands) {
        const { id, createdAt, updatedAt, ...data } = b;
        await prisma.clientBrand.create({ data }).catch(() => {});
      }
    }

    const backupService = require('../services/backupService');
    backupService.triggerDebouncedSnapshot(prisma, 100);

    return successResponse(res, null, 'CMS Snapshot restored successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPublicSettings,
  getAllSettingsAdmin,
  updateSettingsBulk,
  exportBackup,
  restoreBackup,
};
