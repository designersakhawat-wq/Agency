const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// TESTIMONIALS
const getPublicTestimonials = async (req, res, next) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { active: true },
      orderBy: [{ featured: 'desc' }, { order: 'asc' }],
    });
    return successResponse(res, testimonials, 'Testimonials retrieved.');
  } catch (err) {
    next(err);
  }
};

const getAllTestimonialsAdmin = async (req, res, next) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
    return successResponse(res, testimonials, 'All testimonials retrieved.');
  } catch (err) {
    next(err);
  }
};

const createTestimonial = async (req, res, next) => {
  try {
    const { clientName, clientRole, clientCompany, clientAvatar, content, rating, projectTitle, featured, active, order } = req.body;

    if (!clientName || !clientCompany || !content) {
      return errorResponse(res, 'Client name, company, and review content are required.', 400);
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        clientName: clientName.trim(),
        clientRole: clientRole || 'Client',
        clientCompany: clientCompany.trim(),
        clientAvatar: clientAvatar || null,
        content: content.trim(),
        rating: rating !== undefined ? parseInt(rating, 10) : 5,
        projectTitle: projectTitle || null,
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
    const { clientName, clientRole, clientCompany, clientAvatar, content, rating, projectTitle, featured, active, order } = req.body;

    const testimonial = await prisma.testimonial.findUnique({ where: { id } });
    if (!testimonial) {
      return errorResponse(res, 'Testimonial not found.', 404);
    }

    const updateData = {};
    if (clientName !== undefined) updateData.clientName = clientName.trim();
    if (clientRole !== undefined) updateData.clientRole = clientRole;
    if (clientCompany !== undefined) updateData.clientCompany = clientCompany.trim();
    if (clientAvatar !== undefined) updateData.clientAvatar = clientAvatar;
    if (content !== undefined) updateData.content = content.trim();
    if (rating !== undefined) updateData.rating = parseInt(rating, 10);
    if (projectTitle !== undefined) updateData.projectTitle = projectTitle;
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
