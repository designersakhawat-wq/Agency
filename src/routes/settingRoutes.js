const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

// Public
router.get('/', settingController.getPublicSettings);

// Admin Protected
router.get('/admin/all', requireAuth, requireRole(['ADMIN']), settingController.getAllSettingsAdmin);
router.get('/all', requireAuth, requireRole(['ADMIN']), settingController.getAllSettingsAdmin);
router.post('/admin/bulk', requireAuth, requireRole(['ADMIN']), settingController.updateSettingsBulk);
router.post('/bulk', requireAuth, requireRole(['ADMIN']), settingController.updateSettingsBulk);

// Backup Export & Restore
router.get('/admin/backup/export', requireAuth, requireRole(['ADMIN']), settingController.exportBackup);
router.post('/admin/backup/restore', requireAuth, requireRole(['ADMIN']), settingController.restoreBackup);

module.exports = router;
