const rateLimit = require('express-rate-limit');
const env = require('../config/env');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again in a few moments.',
  },
});

// Authentication & Contact submissions limiter
const authAndSubmitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // generous limit for smooth admin access
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts. Please wait a minute before trying again.',
  },
});

module.exports = {
  apiLimiter,
  authAndSubmitLimiter,
};
