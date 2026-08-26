const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

// Admin Protected
router.get('/', requireAuth, requireRole(['ADMIN']), dashboardController.getDashboardStats);
router.get('/stats', requireAuth, requireRole(['ADMIN']), dashboardController.getDashboardStats);

module.exports = router;
