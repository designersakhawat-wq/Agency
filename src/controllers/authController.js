const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const env = require('../config/env');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Generate JWT token helper
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
};

/**
 * Admin Login (SEC-01: Backdoor removed — auth is bcrypt-only)
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Please provide both email and password.', 400);
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const cleanPassword = String(password);

    // SEC-10: Basic input validation
    if (cleanEmail.length > 254 || cleanPassword.length > 128) {
      return errorResponse(res, 'Invalid input length.', 400);
    }

    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });
    } catch (dbErr) {
      console.warn('User lookup warning:', dbErr.message);
      return errorResponse(res, 'Authentication service temporarily unavailable.', 503);
    }

    if (!user || !user.password) {
      return errorResponse(res, 'Invalid credentials. Access denied.', 401);
    }

    // SEC-01: Only bcrypt comparison — no hardcoded fallback passwords
    const isMatch = await bcrypt.compare(cleanPassword, user.password).catch(() => false);
    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials. Access denied.', 401);
    }

    const token = generateToken(user);

    return successResponse(
      res,
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar || null,
        },
      },
      'Login successful. Welcome back!'
    );
  } catch (err) {
    console.error('🚨 Login error detail:', err);
    return errorResponse(res, 'Authentication service error. Please try again.', 500);
  }
};

/**
 * Get current authenticated user
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    return successResponse(res, { user: req.user }, 'User session verified.');
  } catch (err) {
    next(err);
  }
};

/**
 * Update Admin Profile & Password
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, email, avatar, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return errorResponse(res, 'User not found.', 404);
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (avatar !== undefined) updateData.avatar = avatar;

    if (email && email.toLowerCase() !== user.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
      if (emailExists) {
        return errorResponse(res, 'This email address is already in use.', 400);
      }
      updateData.email = email.toLowerCase().trim();
    }

    if (newPassword) {
      if (!currentPassword) {
        return errorResponse(res, 'Current password is required to change password.', 400);
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return errorResponse(res, 'Current password entered is incorrect.', 400);
      }
      if (newPassword.length < 6) {
        return errorResponse(res, 'New password must be at least 6 characters long.', 400);
      }
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
      },
    });

    return successResponse(res, { user: updatedUser }, 'Profile updated successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  login,
  getMe,
  updateProfile,
};
