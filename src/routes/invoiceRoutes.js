const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const { authAndSubmitLimiter } = require('../middleware/rateLimiter');

// Admin protected routes
router.get('/admin/all', requireAuth, requireRole(['ADMIN']), invoiceController.getAllInvoices);
router.get('/all', requireAuth, requireRole(['ADMIN']), invoiceController.getAllInvoices);
router.get('/', requireAuth, requireRole(['ADMIN']), invoiceController.getAllInvoices);
router.post('/', requireAuth, requireRole(['ADMIN']), invoiceController.createInvoice);
router.put('/:id', requireAuth, requireRole(['ADMIN']), invoiceController.updateInvoice);
router.delete('/:id', requireAuth, requireRole(['ADMIN']), invoiceController.deleteInvoice);

// Public/Client printable invoice view (rate limited to prevent ID enumeration)
router.get('/:id', authAndSubmitLimiter, invoiceController.getInvoiceById);

module.exports = router;
