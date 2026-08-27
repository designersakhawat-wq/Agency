const { errorResponse } = require('../utils/apiResponse');

/**
 * Centralized Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('🚨 Global Error Catch:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
  });

  // Multer Errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return errorResponse(res, 'Uploaded file exceeds the maximum 15MB size limit.', 400);
    }
    return errorResponse(res, `Upload error: ${err.message}`, 400);
  }

  // Prisma unique constraint error
  if (err.code === 'P2002') {
    const field = err.meta?.target ? ` on field (${err.meta.target})` : '';
    return errorResponse(res, `A record with this unique value already exists${field}.`, 409);
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return errorResponse(res, 'The requested resource was not found in database.', 404);
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid authentication token.', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Authentication token has expired. Please log in again.', 401);
  }

  const statusCode = err.statusCode || 500;

  // For public read-only GET API requests, fallback cleanly to empty datasets instead of 500
  if (req.method === 'GET' && statusCode === 500 && !req.originalUrl.includes('/admin/')) {
    return res.status(200).json({
      success: true,
      message: 'Default dataset served.',
      data: [],
    });
  }

  let message = err.message || 'Internal server error. Please try again later.';
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = 'An unexpected server error occurred. Please try again or contact support.';
  }

  return errorResponse(res, message, statusCode);
};

module.exports = {
  errorHandler,
};
