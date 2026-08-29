const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const upload = require('../middleware/uploadMiddleware');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

// Admin Protected
router.post('/upload', requireAuth, requireRole(['ADMIN']), upload.single('file'), mediaController.uploadMedia);
router.post('/upload-multiple', requireAuth, requireRole(['ADMIN']), upload.array('files', 10), mediaController.uploadMedia);
router.post('/scan', requireAuth, requireRole(['ADMIN']), mediaController.scanExistingMedia);
router.post('/admin/scan', requireAuth, requireRole(['ADMIN']), mediaController.scanExistingMedia);
router.get('/all', requireAuth, requireRole(['ADMIN']), mediaController.getAllMediaAdmin);
router.get('/', requireAuth, requireRole(['ADMIN']), mediaController.getAllMediaAdmin);
router.get('/storage-status', requireAuth, requireRole(['ADMIN']), mediaController.getStorageStatus);
router.post('/test-cloudinary', requireAuth, requireRole(['ADMIN']), mediaController.testCloudinary);
router.post('/migrate-cloudinary', requireAuth, requireRole(['ADMIN']), mediaController.migrateCloudinary);
router.post('/:id/optimize', requireAuth, requireRole(['ADMIN']), mediaController.optimizeMedia);
router.post('/optimize', requireAuth, requireRole(['ADMIN']), mediaController.optimizeMedia);
router.put('/:id', requireAuth, requireRole(['ADMIN']), mediaController.updateMedia);
router.delete('/:id', requireAuth, requireRole(['ADMIN']), mediaController.deleteMedia);

module.exports = router;
