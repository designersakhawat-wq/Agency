const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const { authAndSubmitLimiter } = require('../middleware/rateLimiter');

// Public
router.post('/', authAndSubmitLimiter, bookingController.createBooking);
router.get('/busy-slots', bookingController.getBusySlots);

// Admin Protected
router.get('/admin/all', requireAuth, requireRole(['ADMIN']), bookingController.getAllBookingsAdmin);
router.put('/admin/:id', requireAuth, requireRole(['ADMIN']), bookingController.updateBooking);
router.delete('/admin/:id', requireAuth, requireRole(['ADMIN']), bookingController.deleteBooking);

module.exports = router;
