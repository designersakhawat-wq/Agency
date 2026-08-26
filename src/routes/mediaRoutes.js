const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const upload = require('../middleware/uploadMiddleware');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

// Admin Protected
router.post('/upload', requireAuth, requireRole(['ADMIN']), upload.single('file'), mediaController.uploadMedia);
router.post('/upload-multiple', requireAuth, requireRole(['ADMIN']), upload.array('files', 10), mediaController.uploadMedia);
router.get('/', requireAuth, requireRole(['ADMIN']), mediaController.getAllMediaAdmin);
router.put('/:id', requireAuth, requireRole(['ADMIN']), mediaController.updateMedia);
router.delete('/:id', requireAuth, requireRole(['ADMIN']), mediaController.deleteMedia);

module.exports = router;
