const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

// Admin Protected routes (must be mounted before /:slug)
router.get('/admin/all', requireAuth, requireRole(['ADMIN']), projectController.getAllProjectsAdmin);
router.get('/all', requireAuth, requireRole(['ADMIN']), projectController.getAllProjectsAdmin);
router.post('/admin', requireAuth, requireRole(['ADMIN']), projectController.createProject);
router.put('/admin/:id', requireAuth, requireRole(['ADMIN']), projectController.updateProject);
router.delete('/admin/:id', requireAuth, requireRole(['ADMIN']), projectController.deleteProject);

// Public routes
router.get('/', projectController.getPublicProjects);
router.get('/:slug', projectController.getProjectBySlug);

module.exports = router;
