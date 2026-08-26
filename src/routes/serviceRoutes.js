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

// Public routes
router.get('/', getPublicServices);
router.get('/:slug', getServiceBySlug);

// Admin routes
router.get('/admin/all', verifyToken, requireAdmin, getAllServicesAdmin);
router.post('/admin', verifyToken, requireAdmin, createService);
router.put('/admin/:id', verifyToken, requireAdmin, updateService);
router.delete('/admin/:id', verifyToken, requireAdmin, deleteService);

module.exports = router;
