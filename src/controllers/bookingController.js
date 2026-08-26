const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const emailService = require('../services/emailService');

/**
 * Public: Book a new meeting consultation
 * POST /api/bookings
 */
const createBooking = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      serviceName,
      date,
      timeSlot,
      notes,
      projectDetails,
      budget,
      meetingType,
    } = req.body;

    if (!name || !email || !date || !timeSlot) {
      return errorResponse(res, 'Please provide name, email, date, and time slot.', 400);
    }

    // Check for double bookings on the same date and slot (excluding cancelled ones)
    const existing = await prisma.booking.findFirst({
      where: {
        date,
        timeSlot,
        status: { not: 'CANCELLED' },
      },
    });

    if (existing) {
      return errorResponse(
        res,
        'This time slot has already been reserved. Please select another convenient time.',
        409
      );
    }

    // Compile notes
    let fullNotes = notes || projectDetails || '';
    const details = [];
    if (company) details.push(`Company: ${company}`);
    if (meetingType) details.push(`Meeting Type: ${meetingType}`);
    if (budget) details.push(`Budget: ${budget}`);

    if (details.length > 0) {
      fullNotes = `[${details.join(' | ')}]\n${fullNotes}`;
    }

    // 1. Create booking record in database
    const booking = await prisma.booking.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : null,
        company: company ? company.trim() : null,
        serviceName: serviceName || 'General Consultation',
        date,
        timeSlot,
        notes: fullNotes,
        status: 'PENDING',
      },
    });

    // 2. Dispatch Email Notification
    try {
      if (emailService && typeof emailService.sendBookingNotification === 'function') {
        await emailService.sendBookingNotification(booking);
      }
    } catch (emailErr) {
      console.warn('Booking notification email failed to send, but saved to DB:', emailErr.message);
    }

    return successResponse(
      res,
      booking,
      'Your consultation has been reserved successfully! We will confirm details via email.',
      201
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Public: Get busy/booked slots for a date
 * GET /api/bookings/busy-slots?date=YYYY-MM-DD
 */
const getBusySlots = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) {
      return errorResponse(res, 'Date query parameter is required.', 400);
    }

    const bookings = await prisma.booking.findMany({
      where: {
        date,
        status: { not: 'CANCELLED' },
      },
      select: { timeSlot: true },
    });

    const busySlots = bookings.map((b) => b.timeSlot);
    return successResponse(res, busySlots, 'Busy slots retrieved.');
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Get all bookings
 * GET /api/admin/bookings
 */
const getAllBookingsAdmin = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;

    const where = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const total = await prisma.booking.count({ where });
    const bookings = await prisma.booking.findMany({
      where,
      orderBy: [{ date: 'asc' }, { timeSlot: 'asc' }],
      skip: (parseInt(page, 10) - 1) * parseInt(limit, 10),
      take: parseInt(limit, 10),
    });

    return successResponse(
      res,
      bookings,
      'Bookings retrieved successfully.',
      200,
      {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / parseInt(limit, 10)),
      }
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Update booking status or assign meeting link
 * PUT /api/admin/bookings/:id
 */
const updateBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, meetingLink, notes } = req.body;

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      return errorResponse(res, 'Booking not found.', 404);
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (meetingLink !== undefined) updateData.meetingLink = meetingLink;
    if (notes !== undefined) updateData.notes = notes;

    const updated = await prisma.booking.update({
      where: { id },
      data: updateData,
    });

    return successResponse(res, updated, 'Booking updated successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Delete booking
 * DELETE /api/admin/bookings/:id
 */
const deleteBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.booking.delete({ where: { id } });
    return successResponse(res, null, 'Booking deleted successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBooking,
  getBusySlots,
  getAllBookingsAdmin,
  updateBooking,
  deleteBooking,
};
