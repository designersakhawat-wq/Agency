const express = require('express');
const router = express.Router();
const testimonialController = require('../controllers/testimonialController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

// Public
router.get('/', testimonialController.getPublicTestimonials);

// Admin Protected
router.get('/admin/all', requireAuth, requireRole(['ADMIN']), testimonialController.getAllTestimonialsAdmin);
router.post('/admin', requireAuth, requireRole(['ADMIN']), testimonialController.createTestimonial);
router.put('/admin/:id', requireAuth, requireRole(['ADMIN']), testimonialController.updateTestimonial);
router.delete('/admin/:id', requireAuth, requireRole(['ADMIN']), testimonialController.deleteTestimonial);

module.exports = router;
