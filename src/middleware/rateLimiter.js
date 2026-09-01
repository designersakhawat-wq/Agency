const rateLimit = require('express-rate-limit');
const env = require('../config/env');

// SEC-13: Tightened from 5000 → 300 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again in a few moments.',
  },
});

// SEC-13: Tightened from 500 → 15 for auth/submission (prevents brute-force)
const authAndSubmitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts. Please wait before trying again.',
  },
});

module.exports = {
  apiLimiter,
  authAndSubmitLimiter,
};
