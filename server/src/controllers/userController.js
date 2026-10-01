const User = require('../models/User');
const AppError = require('../utils/customError');
const { logAudit } = require('../middleware/auditMiddleware');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (ADMIN)
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', role = '' } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } },
      ];
    }

    if (role) {
      query.role = role;
    }

    const count = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
      data: {
        users,
        page: Number(page),
        pages: Math.ceil(count / limit),
        total: count,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new user by Admin
// @route   POST /api/users
// @access  Private (ADMIN)
const createUserByAdmin = async (req, res, next) => {
  try {
    const { fullName, email, password, phone, organization, role } = req.body;

    if (!fullName || !email || !password || !role) {
      return next(new AppError('Full name, email, password, and role are required', 400));
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
      organization: organization || 'Department of Acquisition & Logistics',
      role,
      isActive: true,
    });

    await logAudit({
      req,
      action: 'ADMIN_CREATE_USER',
      entityType: 'User',
      entityId: user._id.toString(),
      newValue: { email: user.email, role: user.role },
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully by Administrator',
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        organization: user.organization,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role or status
// @route   PATCH /api/users/:id
// @access  Private (ADMIN)
const updateUser = async (req, res, next) => {
  try {
    const { role, isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const oldValue = { role: user.role, isActive: user.isActive };
    if (role) user.role = role;
    if (typeof isActive === 'boolean') user.isActive = isActive;

    await user.save();

    await logAudit({
      req,
      action: 'UPDATE_USER_ROLE',
      entityType: 'User',
      entityId: user._id.toString(),
      oldValue,
      newValue: { role: user.role, isActive: user.isActive },
    });

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, createUserByAdmin, updateUser };
