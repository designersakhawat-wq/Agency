const prisma = require('../config/db');
const { successResponse } = require('../utils/apiResponse');
const cacheService = require('../services/cacheService');

const PRIVATE_SETTING_KEYS = [
  'cloudinary_api_secret',
  'cloudinary_api_key',
  'smtp_pass',
  'jwt_secret',
  'admin_password',
];

/**
 * Consolidated Homepage Bootstrap Endpoint
 * Wrapped with Multi-Tier Distributed Cache & Singleflight Mutex
 * GET /api/homepage
 */
const getHomepageData = async (req, res, next) => {
  try {
    const data = await cacheService.wrap(
      'portfolio:homepage:data',
      async () => {
        const [
          rawSettings,
          featuredProjects,
          services,
          packages,
          testimonials,
          faqs,
          brands,
        ] = await Promise.all([
          prisma.siteSetting.findMany().catch(() => []),
          prisma.project.findMany({
            where: { active: true },
            orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
            take: 16,
          }).catch(() => []),
          prisma.service.findMany({
            where: { active: true },
            orderBy: { order: 'asc' },
            include: {
              packages: {
                where: { active: true },
                orderBy: { order: 'asc' },
              },
            },
          }).catch(() => []),
          prisma.package.findMany({
            where: { active: true },
            orderBy: { order: 'asc' },
          }).catch(() => []),
          prisma.testimonial.findMany({
            where: { active: true, status: 'APPROVED' },
            orderBy: { order: 'asc' },
            take: 10,
          }).catch(() => []),
          prisma.faq.findMany({
            where: { active: true },
            orderBy: { order: 'asc' },
          }).catch(() => []),
          prisma.clientBrand.findMany({
            where: { active: true },
            orderBy: { order: 'asc' },
          }).catch(() => []),
        ]);

        // Format settings map with sensitive key filtering
        const settingsMap = {};
        rawSettings.forEach((item) => {
          if (PRIVATE_SETTING_KEYS.includes(item.key.toLowerCase())) return;

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

        return {
          settings: settingsMap,
          projects: featuredProjects,
          services,
          packages,
          testimonials,
          faqs,
          brands,
        };
      },
      { ttl: 3600, tags: ['homepage', 'projects', 'services', 'settings', 'testimonials', 'brands', 'faqs'] }
    );

    return successResponse(res, data, 'Homepage data retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getHomepageData,
};
