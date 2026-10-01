const SupplyContract = require('../models/SupplyContract');
const AppError = require('../utils/customError');
const { analyzeContract } = require('../services/aiService');
const { logAudit } = require('../middleware/auditMiddleware');

// @desc    Get all contracts
// @route   GET /api/contracts
// @access  Private
const getContracts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { contractNumber: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) query.status = status;

    const count = await SupplyContract.countDocuments(query);
    const contracts = await SupplyContract.find(query)
      .populate('supplierId', 'companyName supplierId qualityScore')
      .populate('procurementRequestId', 'requestId title')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      message: 'Contracts loaded successfully',
      data: {
        contracts,
        page: Number(page),
        pages: Math.ceil(count / limit),
        total: count,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get contract by ID
// @route   GET /api/contracts/:id
// @access  Private
const getContractById = async (req, res, next) => {
  try {
    const contract = await SupplyContract.findById(req.params.id)
      .populate('supplierId')
      .populate('procurementRequestId')
      .populate('createdBy', 'fullName email role');

    if (!contract) {
      return next(new AppError('Contract not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Contract details loaded',
      data: contract,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new contract
// @route   POST /api/contracts
// @access  Private (CONTRACT_MANAGER, ADMIN)
const createContract = async (req, res, next) => {
  try {
    const { procurementRequestId, supplierId, title, description, contractValue, startDate, endDate, paymentTerms, deliveryTerms, penaltyTerms } = req.body;

    if (!procurementRequestId || !supplierId || !title || !contractValue || !startDate || !endDate) {
      return next(new AppError('Requisition ID, supplier, title, value, and dates are required', 400));
    }

    const count = await SupplyContract.countDocuments();
    const contractNumber = `CTR-2026-${String(count + 1).padStart(3, '0')}`;

    const contract = await SupplyContract.create({
      contractNumber,
      procurementRequestId,
      supplierId,
      title,
      description: description || '',
      contractValue,
      startDate,
      endDate,
      paymentTerms: paymentTerms || 'Milestone Payments - Net 30',
      deliveryTerms: deliveryTerms || 'FOB Destination',
      penaltyTerms: penaltyTerms || '1% per week delay up to 10%',
      status: 'ACTIVE',
      createdBy: req.user._id,
    });

    await logAudit({
      req,
      action: 'CREATE_CONTRACT',
      entityType: 'SupplyContract',
      entityId: contract._id.toString(),
      newValue: { contractNumber: contract.contractNumber, value: contract.contractValue },
    });

    res.status(201).json({
      success: true,
      message: 'Supply contract created successfully',
      data: contract,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Run AI Contract Intelligence
// @route   POST /api/contracts/:id/ai-analysis
// @access  Private
const runAIContractAnalysis = async (req, res, next) => {
  try {
    const contract = await SupplyContract.findById(req.params.id);
    if (!contract) {
      return next(new AppError('Contract not found', 404));
    }

    const aiResult = await analyzeContract(contract);
    contract.aiExtraction = {
      ...aiResult,
      analyzedAt: new Date(),
    };
    await contract.save();

    await logAudit({
      req,
      action: 'AI_CONTRACT_INTELLIGENCE',
      entityType: 'SupplyContract',
      entityId: contract._id.toString(),
    });

    res.status(200).json({
      success: true,
      message: 'AI Contract Intelligence extraction complete',
      data: contract.aiExtraction,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getContracts,
  getContractById,
  createContract,
  runAIContractAnalysis,
};
