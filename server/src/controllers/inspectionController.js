const InspectionReport = require('../models/InspectionReport');
const Shipment = require('../models/Shipment');
const AppError = require('../utils/customError');
const { logAudit } = require('../middleware/auditMiddleware');

// @desc    Get all inspection reports
// @route   GET /api/inspections
// @access  Private
const getInspections = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, qualityStatus = '' } = req.query;
    const query = {};

    if (qualityStatus) query.qualityStatus = qualityStatus;

    const count = await InspectionReport.countDocuments(query);
    const inspections = await InspectionReport.find(query)
      .populate('shipmentId', 'shipmentId item trackingNumber supplierId')
      .populate('inspector', 'fullName email role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      message: 'Inspection reports loaded',
      data: {
        inspections,
        page: Number(page),
        pages: Math.ceil(count / limit),
        total: count,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create inspection report
// @route   POST /api/inspections
// @access  Private
const createInspection = async (req, res, next) => {
  try {
    const { shipmentId, receivedQuantity, acceptedQuantity, rejectedQuantity, qualityStatus, defects, notes } = req.body;

    if (!shipmentId || receivedQuantity === undefined || acceptedQuantity === undefined) {
      return next(new AppError('Shipment ID, received, and accepted quantities are required', 400));
    }

    const count = await InspectionReport.countDocuments();
    const inspectionId = `INS-2026-${String(count + 1).padStart(3, '0')}`;

    const report = await InspectionReport.create({
      inspectionId,
      shipmentId,
      inspector: req.user._id,
      inspectionDate: new Date(),
      receivedQuantity,
      acceptedQuantity,
      rejectedQuantity: rejectedQuantity || (receivedQuantity - acceptedQuantity),
      qualityStatus: qualityStatus || (acceptedQuantity === receivedQuantity ? 'PASSED' : 'PARTIAL_PASS'),
      defects: defects || [],
      notes: notes || '',
    });

    // Update shipment inspection status
    const shipment = await Shipment.findById(shipmentId);
    if (shipment) {
      shipment.inspectionStatus = report.qualityStatus === 'FAILED' ? 'FAILED' : 'PASSED';
      await shipment.save();
    }

    await logAudit({
      req,
      action: 'CREATE_INSPECTION_REPORT',
      entityType: 'InspectionReport',
      entityId: report._id.toString(),
    });

    res.status(201).json({
      success: true,
      message: 'Quality inspection report logged',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInspections,
  createInspection,
};
