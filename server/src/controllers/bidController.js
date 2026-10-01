const BidSubmission = require('../models/BidSubmission');
const ProcurementRequirement = require('../models/ProcurementRequirement');
const Supplier = require('../models/Supplier');
const AppError = require('../utils/customError');
const { analyzeBids } = require('../services/aiService');
const { logAudit } = require('../middleware/auditMiddleware');

// @desc    Get bids list (Filtered by user role if Vendor)
// @route   GET /api/bids
// @access  Private
const getBids = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, procurementRequestId = '', status = '' } = req.query;
    const query = {};

    if (procurementRequestId) query.procurementRequestId = procurementRequestId;
    if (status) query.status = status;

    // Vendor users only see their own bids
    if (req.user.role === 'VENDOR') {
      query.vendorUserId = req.user._id;
    }

    const count = await BidSubmission.countDocuments(query);
    const bids = await BidSubmission.find(query)
      .populate('supplierId', 'companyName supplierId qualityScore deliveryScore riskScore')
      .populate('procurementRequestId', 'requestId title estimatedBudget requiredDate')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      message: 'Bids loaded successfully',
      data: {
        bids,
        page: Number(page),
        pages: Math.ceil(count / limit),
        total: count,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit a new bid
// @route   POST /api/bids
// @access  Private (VENDOR, PROCUREMENT_OFFICER, ADMIN)
const submitBid = async (req, res, next) => {
  try {
    const { procurementRequestId, supplierId, quotedPrice, deliveryTimeDays, validityPeriodDate, technicalProposal, paymentTerms } = req.body;

    if (!procurementRequestId || !quotedPrice || !deliveryTimeDays || !technicalProposal) {
      return next(new AppError('Procurement ID, price, delivery time, and technical proposal are required', 400));
    }

    const count = await BidSubmission.countDocuments();
    const bidId = `BID-2026-${String(count + 1).padStart(3, '0')}`;

    // Link supplier if vendor user profile or provided in payload
    let targetSupplierId = supplierId;
    if (!targetSupplierId && req.user.role === 'VENDOR') {
      const sup = await Supplier.findOne({ email: req.user.email });
      targetSupplierId = sup ? sup._id : null;
    }

    const bid = await BidSubmission.create({
      bidId,
      procurementRequestId,
      supplierId: targetSupplierId,
      vendorUserId: req.user._id,
      quotedPrice,
      deliveryTimeDays,
      validityPeriodDate: validityPeriodDate || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      technicalProposal,
      paymentTerms: paymentTerms || 'Net 30',
      status: 'SUBMITTED',
    });

    await logAudit({
      req,
      action: 'SUBMIT_BID',
      entityType: 'BidSubmission',
      entityId: bid._id.toString(),
      newValue: { bidId: bid.bidId, quotedPrice: bid.quotedPrice },
    });

    res.status(201).json({
      success: true,
      message: 'Bid proposal submitted successfully',
      data: bid,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get side-by-side bid comparison matrix for a procurement requirement
// @route   GET /api/bids/comparison/:procurementRequestId
// @access  Private
const getBidComparison = async (req, res, next) => {
  try {
    const { procurementRequestId } = req.params;

    const requirement = await ProcurementRequirement.findById(procurementRequestId);
    if (!requirement) {
      return next(new AppError('Procurement requirement not found', 404));
    }

    const bids = await BidSubmission.find({ procurementRequestId })
      .populate('supplierId', 'companyName supplierId qualityScore deliveryScore complianceScore riskScore yearsInBusiness');

    res.status(200).json({
      success: true,
      message: 'Bid comparison matrix generated',
      data: {
        requirement,
        bids,
        bidsCount: bids.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Run AI Bid Comparative Analysis
// @route   POST /api/bids/ai-analysis
// @access  Private
const runAIBidAnalysis = async (req, res, next) => {
  try {
    const { procurementRequestId } = req.body;
    const requirement = await ProcurementRequirement.findById(procurementRequestId);
    if (!requirement) {
      return next(new AppError('Procurement requirement not found', 404));
    }

    const bids = await BidSubmission.find({ procurementRequestId }).populate('supplierId');
    if (bids.length === 0) {
      return next(new AppError('No bids available to compare for this requirement', 400));
    }

    const aiAnalysisResult = await analyzeBids(requirement, bids);

    res.status(200).json({
      success: true,
      message: 'AI Bid comparative analysis complete',
      data: aiAnalysisResult,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBids,
  submitBid,
  getBidComparison,
  runAIBidAnalysis,
};
