const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

// Public/Client printable invoice view
router.get('/:id', invoiceController.getInvoiceById);

// Admin protected routes
router.get('/', requireAuth, requireRole(['ADMIN']), invoiceController.getAllInvoices);
router.post('/', requireAuth, requireRole(['ADMIN']), invoiceController.createInvoice);
router.put('/:id', requireAuth, requireRole(['ADMIN']), invoiceController.updateInvoice);
router.delete('/:id', requireAuth, requireRole(['ADMIN']), invoiceController.deleteInvoice);

module.exports = router;
