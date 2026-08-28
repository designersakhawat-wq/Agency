const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const emailService = require('../services/emailService');

/**
 * Public: Submit a contact inquiry
 * POST /api/inquiries
 */
const createInquiry = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      service,
      budget,
      projectType,
      deadline,
      message,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
      landingPage,
      referrer,
    } = req.body;

    if (!name || !email || !message) {
      return errorResponse(res, 'Please provide your name, email, and message.', 400);
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse(res, 'Please provide a valid email address.', 400);
    }

    // Format rich subject
    const subject = projectType
      ? `Project Inquiry: ${projectType} (${service || 'General'})`
      : `New Inquiry from ${name}`;

    // Format full details into message
    let enrichedMessage = message.trim();
    const extraDetails = [];
    if (company) extraDetails.push(`Company: ${company}`);
    if (projectType) extraDetails.push(`Project Type: ${projectType}`);
    if (deadline) extraDetails.push(`Target Deadline: ${deadline}`);

    if (extraDetails.length > 0) {
      enrichedMessage = `[Client Details: ${extraDetails.join(' | ')}]\n\n${enrichedMessage}`;
    }

    // 1. Always persist to database first
    const inquiry = await prisma.contactInquiry.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : null,
        company: company ? company.trim() : null,
        service: service || null,
        budget: budget || null,
        subject,
        message: enrichedMessage,
        status: 'UNREAD',
        utmSource: utmSource ? String(utmSource).trim() : null,
        utmMedium: utmMedium ? String(utmMedium).trim() : null,
        utmCampaign: utmCampaign ? String(utmCampaign).trim() : null,
        utmContent: utmContent ? String(utmContent).trim() : null,
        utmTerm: utmTerm ? String(utmTerm).trim() : null,
        landingPage: landingPage ? String(landingPage).trim() : null,
        referrer: referrer ? String(referrer).trim() : null,
      },
    });

    // 2. Dispatch Email Notification asynchronously
    try {
      if (emailService && typeof emailService.sendInquiryNotification === 'function') {
        await emailService.sendInquiryNotification(inquiry);
      }
    } catch (emailErr) {
      console.warn('Inquiry notification email failed to send, but saved to DB:', emailErr.message);
    }

    return successResponse(
      res,
      { id: inquiry.id, createdAt: inquiry.createdAt },
      'Thanks for reaching out! Your project inquiry has been received. Sakhawat will get back to you shortly.',
      201
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Get all inquiries
 * GET /api/admin/inquiries
 */
const getAllInquiriesAdmin = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;

    const where = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { message: { contains: search } },
        { company: { contains: search } },
      ];
    }

    const total = await prisma.contactInquiry.count({ where }).catch(() => 0);
    const inquiries = await prisma.contactInquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page, 10) - 1) * parseInt(limit, 10),
      take: parseInt(limit, 10),
    }).catch(() => []);

    return successResponse(
      res,
      inquiries,
      'Inquiries retrieved successfully.',
      200,
      {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil((total || 1) / parseInt(limit, 10)),
      }
    );
  } catch (err) {
    return successResponse(
      res,
      [],
      'Fallback inquiries.',
      200,
      { total: 0, page: 1, limit: 50, totalPages: 1 }
    );
  }
};

/**
 * Admin: Update inquiry status or notes
 * PUT /api/admin/inquiries/:id
 */
const updateInquiryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const inquiry = await prisma.contactInquiry.findUnique({ where: { id } });
    if (!inquiry) {
      return errorResponse(res, 'Inquiry not found.', 404);
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const updated = await prisma.contactInquiry.update({
      where: { id },
      data: updateData,
    });

    return successResponse(res, updated, 'Inquiry status updated successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Delete inquiry
 * DELETE /api/admin/inquiries/:id
 */
const deleteInquiry = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.contactInquiry.delete({ where: { id } });
    return successResponse(res, null, 'Inquiry deleted successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createInquiry,
  getAllInquiriesAdmin,
  updateInquiryStatus,
  deleteInquiry,
};
