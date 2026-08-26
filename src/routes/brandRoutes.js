const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

// Public
router.get('/', brandController.getPublicBrands);

// Admin Protected
router.get('/admin/all', requireAuth, requireRole(['ADMIN']), brandController.getAllBrandsAdmin);
router.post('/admin', requireAuth, requireRole(['ADMIN']), brandController.createBrand);
router.put('/admin/:id', requireAuth, requireRole(['ADMIN']), brandController.updateBrand);
router.delete('/admin/:id', requireAuth, requireRole(['ADMIN']), brandController.deleteBrand);

module.exports = router;
