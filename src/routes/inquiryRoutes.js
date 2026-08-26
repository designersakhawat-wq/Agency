const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/inquiryController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const { authAndSubmitLimiter } = require('../middleware/rateLimiter');

// Public Contact Form Submission
router.post('/', authAndSubmitLimiter, inquiryController.createInquiry);

// Admin Protected
router.get('/admin/all', requireAuth, requireRole(['ADMIN']), inquiryController.getAllInquiriesAdmin);
router.put('/admin/:id', requireAuth, requireRole(['ADMIN']), inquiryController.updateInquiryStatus);
router.delete('/admin/:id', requireAuth, requireRole(['ADMIN']), inquiryController.deleteInquiry);

module.exports = router;
