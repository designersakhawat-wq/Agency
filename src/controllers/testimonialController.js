const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// TESTIMONIALS
const getPublicTestimonials = async (req, res, next) => {
  try {
    const { serviceId, limit } = req.query;

    const where = {
      active: true,
      status: 'APPROVED',
    };

    if (serviceId) {
      where.serviceId = serviceId;
    }

    const testimonials = await prisma.testimonial.findMany({
      where,
      orderBy: [{ featured: 'desc' }, { order: 'asc' }],
      take: limit ? parseInt(limit, 10) : undefined,
    }).catch(() => []);
    return successResponse(res, testimonials, 'Testimonials retrieved.');
  } catch (err) {
    return successResponse(res, [], 'Fallback testimonials.');
  }
};

const getAllTestimonialsAdmin = async (req, res, next) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    }).catch(() => []);
    return successResponse(res, testimonials, 'All testimonials retrieved.');
  } catch (err) {
    return successResponse(res, [], 'Fallback testimonials.');
  }
};

const createTestimonial = async (req, res, next) => {
  try {
    const {
      clientName,
      clientRole,
      clientCompany,
      clientAvatar,
      brandLogo,
      serviceId,
      content,
      rating,
      projectTitle,
      status,
      featured,
      active,
      order,
    } = req.body;

    if (!clientName || !clientCompany || !content) {
      return errorResponse(res, 'Client name, company, and review content are required.', 400);
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        clientName: clientName.trim(),
        clientRole: clientRole || 'Client',
        clientCompany: clientCompany.trim(),
        clientAvatar: clientAvatar || null,
        brandLogo: brandLogo || null,
        serviceId: serviceId || null,
        content: content.trim(),
        rating: rating !== undefined ? parseInt(rating, 10) : 5,
        projectTitle: projectTitle || null,
        status: status || 'APPROVED',
        featured: Boolean(featured),
        active: active !== undefined ? Boolean(active) : true,
        order: order !== undefined ? parseInt(order, 10) : 0,
      },
    });

    return successResponse(res, testimonial, 'Testimonial created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

const updateTestimonial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      clientName,
      clientRole,
      clientCompany,
      clientAvatar,
      brandLogo,
      serviceId,
      content,
      rating,
      projectTitle,
      status,
      featured,
      active,
      order,
    } = req.body;

    const testimonial = await prisma.testimonial.findUnique({ where: { id } });
    if (!testimonial) {
      return errorResponse(res, 'Testimonial not found.', 404);
    }

    const updateData = {};
    if (clientName !== undefined) updateData.clientName = clientName.trim();
    if (clientRole !== undefined) updateData.clientRole = clientRole;
    if (clientCompany !== undefined) updateData.clientCompany = clientCompany.trim();
    if (clientAvatar !== undefined) updateData.clientAvatar = clientAvatar;
    if (brandLogo !== undefined) updateData.brandLogo = brandLogo;
    if (serviceId !== undefined) updateData.serviceId = serviceId;
    if (content !== undefined) updateData.content = content.trim();
    if (rating !== undefined) updateData.rating = parseInt(rating, 10);
    if (projectTitle !== undefined) updateData.projectTitle = projectTitle;
    if (status !== undefined) updateData.status = status;
    if (featured !== undefined) updateData.featured = Boolean(featured);
    if (active !== undefined) updateData.active = Boolean(active);
    if (order !== undefined) updateData.order = parseInt(order, 10);

    const updated = await prisma.testimonial.update({
      where: { id },
      data: updateData,
    });

    return successResponse(res, updated, 'Testimonial updated successfully.');
  } catch (err) {
    next(err);
  }
};

const deleteTestimonial = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.testimonial.delete({ where: { id } });
    return successResponse(res, null, 'Testimonial deleted successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPublicTestimonials,
  getAllTestimonialsAdmin,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
};
