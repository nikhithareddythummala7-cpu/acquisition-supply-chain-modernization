const { analyzeRequirement, evaluateSupplier, analyzeBids, analyzeContract, analyzeRisk } = require('../services/aiService');
const AppError = require('../utils/customError');

// @desc    Direct AI Requirement Analysis
// @route   POST /api/ai/requirement-analysis
const analyzeRequirementHandler = async (req, res, next) => {
  try {
    const result = await analyzeRequirement(req.body);
    res.status(200).json({ success: true, message: 'AI Requirement analysis generated', data: result });
  } catch (err) { next(err); }
};

// @desc    Direct AI Supplier Analysis
// @route   POST /api/ai/supplier-analysis
const evaluateSupplierHandler = async (req, res, next) => {
  try {
    const result = await evaluateSupplier(req.body);
    res.status(200).json({ success: true, message: 'AI Supplier scorecard generated', data: result });
  } catch (err) { next(err); }
};

// @desc    Direct AI Bid Comparative Analysis
// @route   POST /api/ai/bid-analysis
const analyzeBidsHandler = async (req, res, next) => {
  try {
    const { requirement, bids } = req.body;
    if (!requirement || !bids) return next(new AppError('Requirement and bids array required', 400));
    const result = await analyzeBids(requirement, bids);
    res.status(200).json({ success: true, message: 'AI Bid comparison completed', data: result });
  } catch (err) { next(err); }
};

// @desc    Direct AI Contract Legal Intelligence
// @route   POST /api/ai/contract-analysis
const analyzeContractHandler = async (req, res, next) => {
  try {
    const result = await analyzeContract(req.body);
    res.status(200).json({ success: true, message: 'AI Contract extraction completed', data: result });
  } catch (err) { next(err); }
};

// @desc    Direct AI Risk Assessment Predictor
// @route   POST /api/ai/risk-analysis
const analyzeRiskHandler = async (req, res, next) => {
  try {
    const result = await analyzeRisk(req.body);
    res.status(200).json({ success: true, message: 'AI Risk prediction completed', data: result });
  } catch (err) { next(err); }
};

module.exports = {
  analyzeRequirementHandler,
  evaluateSupplierHandler,
  analyzeBidsHandler,
  analyzeContractHandler,
  analyzeRiskHandler,
};
