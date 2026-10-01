const Shipment = require('../models/Shipment');
const AppError = require('../utils/customError');
const { logAudit } = require('../middleware/auditMiddleware');

// @desc    Get all shipments
// @route   GET /api/shipments
// @access  Private
const getShipments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { shipmentId: { $regex: search, $options: 'i' } },
        { trackingNumber: { $regex: search, $options: 'i' } },
        { item: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) query.status = status;

    const count = await Shipment.countDocuments(query);
    const shipments = await Shipment.find(query)
      .populate('supplierId', 'companyName supplierId')
      .populate('contractId', 'contractNumber title')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      message: 'Shipments loaded successfully',
      data: {
        shipments,
        page: Number(page),
        pages: Math.ceil(count / limit),
        total: count,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create shipment
// @route   POST /api/shipments
// @access  Private
const createShipment = async (req, res, next) => {
  try {
    const { contractId, supplierId, item, quantity, shippedQuantity, expectedDeliveryDate, currentLocation, carrierName, trackingNumber } = req.body;

    if (!contractId || !supplierId || !item || !quantity || !trackingNumber) {
      return next(new AppError('Contract, supplier, item, quantity, and tracking number are required', 400));
    }

    const count = await Shipment.countDocuments();
    const shipmentId = `SHP-2026-${String(count + 1).padStart(3, '0')}`;

    const shipment = await Shipment.create({
      shipmentId,
      contractId,
      supplierId,
      item,
      quantity,
      shippedQuantity: shippedQuantity || quantity,
      expectedDeliveryDate,
      currentLocation: currentLocation || 'Warehouse Hub Alpha',
      carrierName: carrierName || 'Global Freight Express',
      trackingNumber,
      status: 'IN_TRANSIT',
    });

    await logAudit({
      req,
      action: 'CREATE_SHIPMENT',
      entityType: 'Shipment',
      entityId: shipment._id.toString(),
    });

    res.status(201).json({
      success: true,
      message: 'Shipment tracking record created',
      data: shipment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update shipment status & location
// @route   PUT /api/shipments/:id
// @access  Private
const updateShipment = async (req, res, next) => {
  try {
    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) {
      return next(new AppError('Shipment not found', 404));
    }

    Object.assign(shipment, req.body);
    await shipment.save();

    await logAudit({
      req,
      action: 'UPDATE_SHIPMENT',
      entityType: 'Shipment',
      entityId: shipment._id.toString(),
    });

    res.status(200).json({
      success: true,
      message: 'Shipment tracking updated',
      data: shipment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getShipments,
  createShipment,
  updateShipment,
};
