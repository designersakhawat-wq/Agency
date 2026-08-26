const prisma = require('../config/db');
const { successResponse } = require('../utils/apiResponse');

/**
 * Admin: Get dashboard analytics, metrics, and recent activity
 * GET /api/admin/dashboard/stats
 */
const getDashboardStats = async (req, res, next) => {
  try {
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
      prisma.project.count(),
      prisma.project.count({ where: { featured: true } }),
      prisma.contactInquiry.count(),
      prisma.contactInquiry.count({ where: { status: 'UNREAD' } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.service.count(),
      prisma.testimonial.count(),
      prisma.media.count(),
      prisma.contactInquiry.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
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

    return successResponse(res, stats, 'Dashboard metrics retrieved.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats,
};
