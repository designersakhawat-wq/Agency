const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Admin: Get all invoices
 * GET /api/invoices
 */
const getAllInvoices = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const where = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search } },
        { clientName: { contains: search } },
        { clientEmail: { contains: search } },
        { clientCompany: { contains: search } },
      ];
    }

    const invoices = await prisma.invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const parsedInvoices = invoices.map((inv) => ({
      ...inv,
      items: typeof inv.items === 'string' ? JSON.parse(inv.items || '[]') : inv.items,
    }));

    return successResponse(res, parsedInvoices, 'Invoices retrieved.');
  } catch (err) {
    next(err);
  }
};

/**
 * Public/Admin: Get invoice by ID or Invoice Number
 * GET /api/invoices/:id
 */
const getInvoiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const invoice = await prisma.invoice.findFirst({
      where: {
        OR: [{ id }, { invoiceNumber: id }],
      },
    });

    if (!invoice) {
      return errorResponse(res, 'Invoice not found.', 404);
    }

    const parsed = {
      ...invoice,
      items: typeof invoice.items === 'string' ? JSON.parse(invoice.items || '[]') : invoice.items,
    };

    return successResponse(res, parsed, 'Invoice retrieved.');
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Create new invoice
 * POST /api/invoices
 */
const createInvoice = async (req, res, next) => {
  try {
    const {
      invoiceNumber,
      clientName,
      clientEmail,
      clientCompany,
      clientAddress,
      clientPhone,
      issueDate,
      dueDate,
      status,
      currency,
      currencyCode,
      items,
      subtotal,
      discountPercent,
      taxPercent,
      totalAmount,
      notes,
      paymentTerms,
      paymentMethods,
    } = req.body;

    if (!clientName || !clientEmail || !items) {
      return errorResponse(res, 'Client Name, Email, and Items are required.', 400);
    }

    // Auto-generate invoice number if empty
    const invNumber = invoiceNumber || `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

    const newInvoice = await prisma.invoice.create({
      data: {
        invoiceNumber: invNumber,
        clientName,
        clientEmail,
        clientCompany: clientCompany || null,
        clientAddress: clientAddress || null,
        clientPhone: clientPhone || null,
        issueDate: issueDate || new Date().toISOString().split('T')[0],
        dueDate: dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        status: status || 'UNPAID',
        currency: currency || '$',
        currencyCode: currencyCode || 'USD',
        items: typeof items === 'object' ? JSON.stringify(items) : String(items),
        subtotal: Number(subtotal) || 0,
        discountPercent: Number(discountPercent) || 0,
        taxPercent: Number(taxPercent) || 0,
        totalAmount: Number(totalAmount) || 0,
        notes: notes || null,
        paymentTerms: paymentTerms || null,
        paymentMethods: paymentMethods || null,
      },
    });

    return successResponse(res, newInvoice, 'Invoice created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Update invoice
 * PUT /api/invoices/:id
 */
const updateInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      invoiceNumber,
      clientName,
      clientEmail,
      clientCompany,
      clientAddress,
      clientPhone,
      issueDate,
      dueDate,
      status,
      currency,
      currencyCode,
      items,
      subtotal,
      discountPercent,
      taxPercent,
      totalAmount,
      notes,
      paymentTerms,
      paymentMethods,
    } = req.body;

    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        invoiceNumber,
        clientName,
        clientEmail,
        clientCompany,
        clientAddress,
        clientPhone,
        issueDate,
        dueDate,
        status,
        currency,
        currencyCode,
        items: typeof items === 'object' ? JSON.stringify(items) : String(items),
        subtotal: Number(subtotal) || 0,
        discountPercent: Number(discountPercent) || 0,
        taxPercent: Number(taxPercent) || 0,
        totalAmount: Number(totalAmount) || 0,
        notes,
        paymentTerms,
        paymentMethods,
      },
    });

    return successResponse(res, updated, 'Invoice updated successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Delete invoice
 * DELETE /api/invoices/:id
 */
const deleteInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.invoice.delete({ where: { id } });
    return successResponse(res, null, 'Invoice deleted successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
};
