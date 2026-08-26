const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const projectRoutes = require('./projectRoutes');
const serviceRoutes = require('./serviceRoutes');
const packageRoutes = require('./packageRoutes');
const testimonialRoutes = require('./testimonialRoutes');
const faqRoutes = require('./faqRoutes');
const brandRoutes = require('./brandRoutes');
const inquiryRoutes = require('./inquiryRoutes');
const bookingRoutes = require('./bookingRoutes');
const mediaRoutes = require('./mediaRoutes');
const invoiceRoutes = require('./invoiceRoutes');
const settingRoutes = require('./settingRoutes');
const dashboardRoutes = require('./dashboardRoutes');

// API Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Md Sakhawat Hossain Portfolio API',
    uptime: process.uptime(),
  });
});

// Mount Routes
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/services', serviceRoutes);
router.use('/packages', packageRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/faqs', faqRoutes);
router.use('/brands', brandRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/bookings', bookingRoutes);
router.use('/admin/media', mediaRoutes);
router.use('/media', mediaRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/settings', settingRoutes);
router.use('/admin/dashboard', dashboardRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
