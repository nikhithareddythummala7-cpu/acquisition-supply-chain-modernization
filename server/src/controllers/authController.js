const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const AppError = require('../utils/customError');
const { logAudit } = require('../middleware/auditMiddleware');

// @desc    Register a new user (Public)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { fullName, email, password, phone, organization, role } = req.body;

    if (!fullName || !email || !password) {
      return next(new AppError('Full name, email, and password are required', 400));
    }

    // Security Check: Rejection of ADMIN role in public registration
    if (role && role.toUpperCase() === 'ADMIN') {
      return next(new AppError('Public registration for the ADMIN role is strictly prohibited.', 400));
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return next(new AppError('User with this email already exists', 400));
    }

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      organization: organization || 'Department of Logistics & Defense',
      role: role || 'PROCUREMENT_OFFICER',
    });

    const token = generateToken(user._id, user.role);

    await logAudit({
      req: { ...req, user },
      action: 'REGISTER_USER',
      entityType: 'User',
      entityId: user._id.toString(),
      newValue: { email: user.email, role: user.role },
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        organization: user.organization,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      await logAudit({
        req,
        action: 'LOGIN_FAILED',
        status: 'FAILED',
      });
      return next(new AppError('Invalid email or password', 401));
    }

    if (!user.isActive) {
      return next(new AppError('Your account has been deactivated', 403));
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id, user.role);

    await logAudit({
      req: { ...req, user },
      action: 'LOGIN_SUCCESS',
      entityType: 'User',
      entityId: user._id.toString(),
    });

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        organization: user.organization,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      message: 'User profile retrieved',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res, next) => {
  try {
    await logAudit({
      req,
      action: 'LOGOUT',
      entityType: 'User',
      entityId: req.user._id.toString(),
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
};
