const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/customError');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Not authorized, token missing', 401));
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'super_secret_jwt_key_acquisition_system_2026_dev'
    );

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(new AppError('User belonging to this token no longer exists', 401));
    }

    if (!user.isActive) {
      return next(new AppError('User account is deactivated', 403));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new AppError('Not authorized, token invalid or expired', 401));
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError(
          `User role '${req.user ? req.user.role : 'GUEST'}' is not authorized to perform this action`,
          403
        )
      );
    }
    next();
  };
};

module.exports = { protect, authorizeRoles };
