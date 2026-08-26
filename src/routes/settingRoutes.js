const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

// Public
router.get('/', settingController.getPublicSettings);

// Admin Protected
router.get('/admin/all', requireAuth, requireRole(['ADMIN']), settingController.getAllSettingsAdmin);
router.post('/admin/bulk', requireAuth, requireRole(['ADMIN']), settingController.updateSettingsBulk);

module.exports = router;
