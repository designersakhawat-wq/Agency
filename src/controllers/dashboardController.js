const prisma = require('../config/db');
const { successResponse } = require('../utils/apiResponse');

let cachedDashboardStats = null;
let lastDashboardFetch = 0;

/**
 * Admin: Get dashboard analytics, metrics, and recent activity
 * GET /api/admin/dashboard/stats
 */
const getDashboardStats = async (req, res, next) => {
  try {
    if (cachedDashboardStats && Date.now() - lastDashboardFetch < 10000) {
      return successResponse(res, cachedDashboardStats, 'Dashboard metrics retrieved (cached).');
    }

    const [
      totalProjects,
      featuredProjects,
      totalInquiries,
      unreadInquiries,
      totalBookings,
      pendingBookings,
      totalServices,
      totalTestimonials,
      totalMedia,
      recentInquiries,
      recentBookings,
    ] = await Promise.all([
      prisma.project.count().catch(() => 0),
      prisma.project.count({ where: { featured: true } }).catch(() => 0),
      prisma.contactInquiry.count().catch(() => 0),
      prisma.contactInquiry.count({ where: { status: 'UNREAD' } }).catch(() => 0),
      prisma.booking.count().catch(() => 0),
      prisma.booking.count({ where: { status: 'PENDING' } }).catch(() => 0),
      prisma.service.count().catch(() => 0),
      prisma.testimonial.count().catch(() => 0),
      prisma.media.count().catch(() => 0),
      prisma.contactInquiry.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }).catch(() => []),
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }).catch(() => []),
    ]);

    const stats = {
      counts: {
        projects: totalProjects,
        featuredProjects,
        inquiries: totalInquiries,
        unreadInquiries,
        bookings: totalBookings,
        pendingBookings,
        services: totalServices,
        testimonials: totalTestimonials,
        media: totalMedia,
      },
      recentInquiries,
      recentBookings,
    };

    cachedDashboardStats = stats;
    lastDashboardFetch = Date.now();

    return successResponse(res, stats, 'Dashboard metrics retrieved.');
  } catch (err) {
    console.error('Dashboard stats warning:', err.message);
    return successResponse(res, {
      counts: {
        projects: 0,
        featuredProjects: 0,
        inquiries: 0,
        unreadInquiries: 0,
        bookings: 0,
        pendingBookings: 0,
        services: 0,
        testimonials: 0,
        media: 0,
      },
      recentInquiries: [],
      recentBookings: [],
    }, 'Fallback dashboard metrics.');
  }
};

module.exports = {
  getDashboardStats,
};
