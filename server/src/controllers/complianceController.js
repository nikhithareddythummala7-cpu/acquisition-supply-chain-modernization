const ComplianceRecord = require('../models/ComplianceRecord');
const AppError = require('../utils/customError');
const { logAudit } = require('../middleware/auditMiddleware');

// @desc    Get all compliance records
// @route   GET /api/compliance
// @access  Private
const getComplianceRecords = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, verificationStatus = '' } = req.query;
    const query = {};

    if (verificationStatus) query.verificationStatus = verificationStatus;

    const count = await ComplianceRecord.countDocuments(query);
    const records = await ComplianceRecord.find(query)
      .populate('supplierId', 'companyName supplierId qualityScore complianceScore')
      .populate('verifiedBy', 'fullName email role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      message: 'Compliance tracking records loaded',
      data: {
        records,
        page: Number(page),
        pages: Math.ceil(count / limit),
        total: count,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create / add compliance record
// @route   POST /api/compliance
// @access  Private
const createComplianceRecord = async (req, res, next) => {
  try {
    const { requiredCertification, supplierId, contractId, expiryDate, verificationStatus } = req.body;

    if (!requiredCertification || !supplierId || !expiryDate) {
      return next(new AppError('Certification title, supplier, and expiry date are required', 400));
    }

    const count = await ComplianceRecord.countDocuments();
    const complianceId = `CMP-2026-${String(count + 1).padStart(3, '0')}`;

    const record = await ComplianceRecord.create({
      complianceId,
      requiredCertification,
      supplierId,
      contractId: contractId || null,
      expiryDate,
      verificationStatus: verificationStatus || 'VERIFIED',
      verifiedBy: req.user._id,
    });

    await logAudit({
      req,
      action: 'CREATE_COMPLIANCE_RECORD',
      entityType: 'ComplianceRecord',
      entityId: record._id.toString(),
    });

    res.status(201).json({
      success: true,
      message: 'Compliance certification record created',
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getComplianceRecords,
  createComplianceRecord,
};
