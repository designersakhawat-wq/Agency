const jwt = require('jsonwebtoken');
const env = require('../config/env');
const prisma = require('../config/db');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Protect routes: require valid JWT token in Authorization header or Bearer cookie
 */
const requireAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return errorResponse(res, 'Authentication required. No token provided.', 401);
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId || decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
      },
    });

    if (!user) {
      return errorResponse(res, 'User session invalid. Account not found.', 401);
    }

    req.user = user;
    next();
  } catch (err) {
    return errorResponse(res, 'Invalid or expired authentication token.', 401);
  }
};

/**
 * Require specific role (e.g. ADMIN)
 */
const requireRole = (roles = ['ADMIN']) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(res, 'Access denied. Administrator privileges required.', 403);
    }
    next();
  };
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return errorResponse(res, 'Access denied. Administrator privileges required.', 403);
  }
  next();
};

module.exports = {
  requireAuth,
  requireRole,
  verifyToken: requireAuth,
  requireAdmin,
};
