const prisma = require('../config/db');
const { successResponse } = require('../utils/apiResponse');

/**
 * Consolidated Homepage Bootstrap Endpoint
 * Collapses 7 separate client HTTP calls into 1 single fast backend database fetch
 * GET /api/homepage
 */
const getHomepageData = async (req, res, next) => {
  try {
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

    // Format settings map
    const settingsMap = {};
    rawSettings.forEach((item) => {
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

    return successResponse(res, {
      settings: settingsMap,
      projects: featuredProjects,
      services,
      packages,
      testimonials,
      faqs,
      brands,
    }, 'Homepage data retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getHomepageData,
};
