const Supplier = require('../models/Supplier');
const ContactPerson = require('../models/ContactPerson');
const AppError = require('../utils/customError');
const { evaluateSupplier } = require('../services/aiService');
const { logAudit } = require('../middleware/auditMiddleware');

// @desc    Get all suppliers with pagination & search
// @route   GET /api/suppliers
// @access  Private
const getSuppliers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', category = '' } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { supplierId: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) query.status = status;
    if (category) query.category = { $in: [category] };

    const count = await Supplier.countDocuments(query);
    const suppliers = await Supplier.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      message: 'Suppliers loaded successfully',
      data: {
        suppliers,
        page: Number(page),
        pages: Math.ceil(count / limit),
        total: count,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single supplier profile + contacts
// @route   GET /api/suppliers/:id
// @access  Private
const getSupplierById = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return next(new AppError('Supplier not found', 404));
    }

    const contacts = await ContactPerson.find({ supplierId: supplier._id });

    res.status(200).json({
      success: true,
      message: 'Supplier profile loaded',
      data: {
        ...supplier.toObject(),
        contacts,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create supplier
// @route   POST /api/suppliers
// @access  Private (PROCUREMENT_OFFICER, ADMIN)
const createSupplier = async (req, res, next) => {
  try {
    const { companyName, email, phone, address, category, yearsInBusiness, qualityScore, deliveryScore, complianceScore, riskScore } = req.body;

    if (!companyName || !email || !phone) {
      return next(new AppError('Company name, email, and phone are required', 400));
    }

    const count = await Supplier.countDocuments();
    const supplierId = `SUP-2026-${String(count + 1).padStart(3, '0')}`;

    const supplier = await Supplier.create({
      supplierId,
      companyName,
      email,
      phone,
      address: address || {},
      category: category || ['General Supplies'],
      yearsInBusiness: yearsInBusiness || 5,
      qualityScore: qualityScore || 85,
      deliveryScore: deliveryScore || 90,
      complianceScore: complianceScore || 92,
      riskScore: riskScore || 15,
      status: 'ACTIVE',
    });

    await logAudit({
      req,
      action: 'CREATE_SUPPLIER',
      entityType: 'Supplier',
      entityId: supplier._id.toString(),
      newValue: { supplierId: supplier.supplierId, companyName: supplier.companyName },
    });

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: supplier,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update supplier profile
// @route   PUT /api/suppliers/:id
// @access  Private (PROCUREMENT_OFFICER, ADMIN)
const updateSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return next(new AppError('Supplier not found', 404));
    }

    Object.assign(supplier, req.body);
    await supplier.save();

    await logAudit({
      req,
      action: 'UPDATE_SUPPLIER',
      entityType: 'Supplier',
      entityId: supplier._id.toString(),
    });

    res.status(200).json({
      success: true,
      message: 'Supplier profile updated',
      data: supplier,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Run AI Supplier Evaluation
// @route   POST /api/suppliers/:id/ai-evaluation
// @access  Private
const runAISupplierEvaluation = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return next(new AppError('Supplier not found', 404));
    }

    const aiResult = await evaluateSupplier(supplier);
    supplier.aiEvaluation = {
      ...aiResult,
      evaluatedAt: new Date(),
    };
    await supplier.save();

    await logAudit({
      req,
      action: 'AI_SUPPLIER_EVALUATION',
      entityType: 'Supplier',
      entityId: supplier._id.toString(),
    });

    res.status(200).json({
      success: true,
      message: 'AI Supplier Evaluation completed',
      data: supplier.aiEvaluation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add contact person for supplier
// @route   POST /api/suppliers/:id/contacts
// @access  Private
const addSupplierContact = async (req, res, next) => {
  try {
    const { name, designation, email, phone, alternatePhone, isPrimary } = req.body;
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return next(new AppError('Supplier not found', 404));
    }

    const contact = await ContactPerson.create({
      supplierId: supplier._id,
      name,
      designation: designation || 'Contact',
      email,
      phone,
      alternatePhone: alternatePhone || '',
      isPrimary: Boolean(isPrimary),
    });

    res.status(201).json({
      success: true,
      message: 'Contact person added',
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  runAISupplierEvaluation,
  addSupplierContact,
};
