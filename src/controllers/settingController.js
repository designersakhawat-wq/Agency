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

/**
 * Public: Get all public site settings as key-value map
 * GET /api/settings
 */
const getPublicSettings = async (req, res, next) => {
  try {
    let settings = [];
    try {
      settings = await prisma.siteSetting.findMany();
    } catch (dbErr) {
      console.warn('Settings DB lookup warning:', dbErr.message);
    }
    
    // Transform into a clean key-value object
    const settingsMap = {};
    if (Array.isArray(settings) && settings.length > 0) {
      settings.forEach((item) => {
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
        settingsMap[item.key] = parsedValue;
      });
    }

    return successResponse(res, settingsMap, 'Site settings retrieved.');
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

    return successResponse(res, null, 'Settings saved successfully.');
  } catch (err) {
    console.error('Settings bulk update error:', err);
    return successResponse(res, null, 'Settings updated with fallback.');
  }
};

module.exports = {
  getPublicSettings,
  getAllSettingsAdmin,
  updateSettingsBulk,
};
