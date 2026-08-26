const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

// Public
router.get('/', faqController.getPublicFaqs);

// Admin Protected
router.get('/admin/all', requireAuth, requireRole(['ADMIN']), faqController.getAllFaqsAdmin);
router.post('/admin', requireAuth, requireRole(['ADMIN']), faqController.createFaq);
router.put('/admin/:id', requireAuth, requireRole(['ADMIN']), faqController.updateFaq);
router.delete('/admin/:id', requireAuth, requireRole(['ADMIN']), faqController.deleteFaq);

module.exports = router;
