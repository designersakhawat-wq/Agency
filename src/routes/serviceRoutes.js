const express = require('express');
const router = express.Router();
const {
  getPublicServices,
  getServiceBySlug,
  getAllServicesAdmin,
  createService,
  updateService,
  deleteService,
} = require('../controllers/serviceController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// Admin routes (must be mounted before /:slug)
router.get('/admin/all', verifyToken, requireAdmin, getAllServicesAdmin);
router.get('/all', verifyToken, requireAdmin, getAllServicesAdmin);
router.post('/admin', verifyToken, requireAdmin, createService);
router.put('/admin/:id', verifyToken, requireAdmin, updateService);
router.delete('/admin/:id', verifyToken, requireAdmin, deleteService);

// Public routes
router.get('/', getPublicServices);
router.get('/:slug', getServiceBySlug);

module.exports = router;
