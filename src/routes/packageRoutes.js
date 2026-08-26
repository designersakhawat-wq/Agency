const express = require('express');
const router = express.Router();
const packageController = require('../controllers/packageController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

// Public
router.get('/', packageController.getPublicPackages);

// Admin Protected
router.get('/admin/all', requireAuth, requireRole(['ADMIN']), packageController.getAllPackagesAdmin);
router.post('/admin', requireAuth, requireRole(['ADMIN']), packageController.createPackage);
router.put('/admin/:id', requireAuth, requireRole(['ADMIN']), packageController.updatePackage);
router.delete('/admin/:id', requireAuth, requireRole(['ADMIN']), packageController.deletePackage);

module.exports = router;
