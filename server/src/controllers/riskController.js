const RiskAssessment = require('../models/RiskAssessment');
const AppError = require('../utils/customError');
const { analyzeRisk } = require('../services/aiService');
const { logAudit } = require('../middleware/auditMiddleware');

// @desc    Get all risk assessments
// @route   GET /api/risks
// @access  Private
const getRisks = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, overallRisk = '', relatedEntityType = '' } = req.query;
    const query = {};

    if (overallRisk) query.overallRisk = overallRisk;
    if (relatedEntityType) query.relatedEntityType = relatedEntityType;

    const count = await RiskAssessment.countDocuments(query);
    const risks = await RiskAssessment.find(query)
      .populate('createdBy', 'fullName email role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      message: 'Risk assessments loaded',
      data: {
        risks,
        page: Number(page),
        pages: Math.ceil(count / limit),
        total: count,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create risk assessment
// @route   POST /api/risks
// @access  Private (RISK_SPECIALIST, ADMIN)
const createRisk = async (req, res, next) => {
  try {
    const { relatedEntityType, relatedEntityId, supplierRisk, deliveryRisk, qualityRisk, complianceRisk, financialRisk, operationalRisk, overallRisk, riskFactors, mitigationActions } = req.body;

    if (!relatedEntityType || !relatedEntityId) {
      return next(new AppError('Entity type and entity ID are required', 400));
    }

    const count = await RiskAssessment.countDocuments();
    const riskId = `RSK-2026-${String(count + 1).padStart(3, '0')}`;

    const risk = await RiskAssessment.create({
      riskId,
      relatedEntityType,
      relatedEntityId,
      supplierRisk: supplierRisk || 20,
      deliveryRisk: deliveryRisk || 20,
      qualityRisk: qualityRisk || 15,
      complianceRisk: complianceRisk || 10,
      financialRisk: financialRisk || 15,
      operationalRisk: operationalRisk || 20,
      overallRisk: overallRisk || 'LOW',
      riskFactors: riskFactors || [],
      mitigationActions: mitigationActions || [],
      status: 'IDENTIFIED',
      createdBy: req.user._id,
    });

    await logAudit({
      req,
      action: 'CREATE_RISK_ASSESSMENT',
      entityType: 'RiskAssessment',
      entityId: risk._id.toString(),
    });

    res.status(201).json({
      success: true,
      message: 'Risk assessment logged',
      data: risk,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Run AI Risk Analysis
// @route   POST /api/risks/:id/ai-analysis
// @access  Private
const runAIRiskAnalysis = async (req, res, next) => {
  try {
    const risk = await RiskAssessment.findById(req.params.id);
    if (!risk) {
      return next(new AppError('Risk assessment record not found', 404));
    }

    const aiResult = await analyzeRisk(risk);
    risk.aiRiskAnalysis = {
      ...aiResult,
      analyzedAt: new Date(),
    };
    await risk.save();

    await logAudit({
      req,
      action: 'AI_RISK_ANALYSIS',
      entityType: 'RiskAssessment',
      entityId: risk._id.toString(),
    });

    res.status(200).json({
      success: true,
      message: 'AI Risk analysis completed',
      data: risk.aiRiskAnalysis,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRisks,
  createRisk,
  runAIRiskAnalysis,
};
