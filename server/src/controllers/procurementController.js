const ProcurementRequirement = require('../models/ProcurementRequirement');
const AppError = require('../utils/customError');
const { analyzeRequirement } = require('../services/aiService');
const { logAudit } = require('../middleware/auditMiddleware');

// @desc    Get all procurement requirements with pagination & filters
// @route   GET /api/procurement
// @access  Private
const getProcurementRequirements = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', category = '', priority = '' } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { requestId: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    const count = await ProcurementRequirement.countDocuments(query);
    const requirements = await ProcurementRequirement.find(query)
      .populate('createdBy', 'fullName email role')
      .populate('assignedOfficer', 'fullName email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      message: 'Procurement requirements fetched successfully',
      data: {
        requirements,
        page: Number(page),
        pages: Math.ceil(count / limit),
        total: count,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single procurement requirement by ID
// @route   GET /api/procurement/:id
// @access  Private
const getProcurementRequirementById = async (req, res, next) => {
  try {
    const requirement = await ProcurementRequirement.findById(req.params.id)
      .populate('createdBy', 'fullName email role organization')
      .populate('assignedOfficer', 'fullName email phone');

    if (!requirement) {
      return next(new AppError('Procurement requirement not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Procurement requirement loaded',
      data: requirement,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create procurement requirement
// @route   POST /api/procurement
// @access  Private (PROCUREMENT_OFFICER, ADMIN)
const createProcurementRequirement = async (req, res, next) => {
  try {
    const { title, description, category, quantity, unitOfMeasure, specifications, estimatedBudget, requiredDate, priority, department, complianceRequirements } = req.body;

    if (!title || !description || !category || !quantity || !estimatedBudget || !requiredDate) {
      return next(new AppError('Please fill in all required fields', 400));
    }

    const count = await ProcurementRequirement.countDocuments();
    const requestId = `PR-2026-${String(count + 1).padStart(3, '0')}`;

    const newReq = await ProcurementRequirement.create({
      requestId,
      title,
      description,
      category,
      quantity,
      unitOfMeasure: unitOfMeasure || 'Units',
      specifications: specifications || {},
      estimatedBudget,
      requiredDate,
      priority: priority || 'MEDIUM',
      department: department || 'Procurement & Logistics',
      complianceRequirements: complianceRequirements || [],
      status: 'DRAFT',
      createdBy: req.user._id,
      assignedOfficer: req.user._id,
    });

    await logAudit({
      req,
      action: 'CREATE_PROCUREMENT_REQUIREMENT',
      entityType: 'ProcurementRequirement',
      entityId: newReq._id.toString(),
      newValue: { requestId: newReq.requestId, title: newReq.title },
    });

    res.status(201).json({
      success: true,
      message: 'Procurement requirement created successfully',
      data: newReq,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update procurement requirement
// @route   PUT /api/procurement/:id
// @access  Private (PROCUREMENT_OFFICER, ADMIN)
const updateProcurementRequirement = async (req, res, next) => {
  try {
    const requirement = await ProcurementRequirement.findById(req.params.id);

    if (!requirement) {
      return next(new AppError('Procurement requirement not found', 404));
    }

    const oldValue = requirement.toObject();
    Object.assign(requirement, req.body);
    await requirement.save();

    await logAudit({
      req,
      action: 'UPDATE_PROCUREMENT_REQUIREMENT',
      entityType: 'ProcurementRequirement',
      entityId: requirement._id.toString(),
      oldValue,
      newValue: requirement.toObject(),
    });

    res.status(200).json({
      success: true,
      message: 'Procurement requirement updated',
      data: requirement,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update requirement status / approval workflow
// @route   PATCH /api/procurement/:id/status
// @access  Private (PROCUREMENT_OFFICER, ADMIN)
const updateRequirementStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const requirement = await ProcurementRequirement.findById(req.params.id);

    if (!requirement) {
      return next(new AppError('Requirement not found', 404));
    }

    const oldStatus = requirement.status;
    requirement.status = status;
    await requirement.save();

    await logAudit({
      req,
      action: `STATUS_CHANGE_${status}`,
      entityType: 'ProcurementRequirement',
      entityId: requirement._id.toString(),
      oldValue: { status: oldStatus },
      newValue: { status: requirement.status },
    });

    res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
      data: requirement,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Analyze requirement with AI
// @route   POST /api/procurement/:id/ai-analysis
// @access  Private
const runAIRequirementAnalysis = async (req, res, next) => {
  try {
    const requirement = await ProcurementRequirement.findById(req.params.id);

    if (!requirement) {
      return next(new AppError('Procurement requirement not found', 404));
    }

    const aiResult = await analyzeRequirement(requirement);
    requirement.aiAnalysis = {
      ...aiResult,
      analyzedAt: new Date(),
    };
    await requirement.save();

    await logAudit({
      req,
      action: 'AI_REQUIREMENT_ANALYSIS',
      entityType: 'ProcurementRequirement',
      entityId: requirement._id.toString(),
    });

    res.status(200).json({
      success: true,
      message: 'AI Requirement analysis completed',
      data: requirement.aiAnalysis,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete procurement requirement
// @route   DELETE /api/procurement/:id
// @access  Private (ADMIN)
const deleteProcurementRequirement = async (req, res, next) => {
  try {
    const requirement = await ProcurementRequirement.findById(req.params.id);
    if (!requirement) {
      return next(new AppError('Requirement not found', 404));
    }

    await requirement.deleteOne();

    await logAudit({
      req,
      action: 'DELETE_PROCUREMENT_REQUIREMENT',
      entityType: 'ProcurementRequirement',
      entityId: req.params.id,
    });

    res.status(200).json({
      success: true,
      message: 'Procurement requirement deleted',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProcurementRequirements,
  getProcurementRequirementById,
  createProcurementRequirement,
  updateProcurementRequirement,
  updateRequirementStatus,
  runAIRequirementAnalysis,
  deleteProcurementRequirement,
};
