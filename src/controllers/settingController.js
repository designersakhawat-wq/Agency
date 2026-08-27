const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/apiResponse');

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
        if (item.value === 'true') {
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
    });
    return successResponse(res, settings, 'All settings retrieved.');
  } catch (err) {
    next(err);
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

    const updates = [];

    if (Array.isArray(settings)) {
      for (const item of settings) {
        if (!item.key) continue;
        const val = typeof item.value === 'object' ? JSON.stringify(item.value) : String(item.value ?? '');
        updates.push(
          prisma.siteSetting.upsert({
            where: { key: item.key },
            update: {
              value: val,
            },
            create: {
              key: item.key,
              value: val,
            },
          })
        );
      }
    } else {
      for (const [key, value] of Object.entries(settings)) {
        const val = typeof value === 'object' ? JSON.stringify(value) : String(value ?? '');
        updates.push(
          prisma.siteSetting.upsert({
            where: { key },
            update: { value: val },
            create: {
              key,
              value: val,
            },
          })
        );
      }
    }

    if (updates.length > 0) {
      await prisma.$transaction(updates);
    }

    return successResponse(res, null, 'Settings saved successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPublicSettings,
  getAllSettingsAdmin,
  updateSettingsBulk,
};
