const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

// Public
router.get('/', projectController.getPublicProjects);
router.get('/:slug', projectController.getProjectBySlug);

// Admin Protected
router.get('/admin/all', requireAuth, requireRole(['ADMIN']), projectController.getAllProjectsAdmin);
router.post('/admin', requireAuth, requireRole(['ADMIN']), projectController.createProject);
router.put('/admin/:id', requireAuth, requireRole(['ADMIN']), projectController.updateProject);
router.delete('/admin/:id', requireAuth, requireRole(['ADMIN']), projectController.deleteProject);

module.exports = router;
