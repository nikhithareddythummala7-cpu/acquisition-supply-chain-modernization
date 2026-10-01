const mongoose = require('mongoose');

const STATUSES = ['PLANNED', 'READY_TO_SHIP', 'IN_TRANSIT', 'DELAYED', 'DELIVERED', 'INSPECTION', 'COMPLETED', 'CANCELLED'];

const shipmentSchema = new mongoose.Schema(
  {
    shipmentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    contractId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SupplyContract',
      required: true,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true,
    },
    item: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    shippedQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    expectedDeliveryDate: {
      type: Date,
      required: true,
    },
    actualDeliveryDate: {
      type: Date,
    },
    currentLocation: {
      type: String,
      default: 'Warehouse Hub Alpha',
    },
    carrierName: {
      type: String,
      default: 'Global Freight Express',
    },
    trackingNumber: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'IN_TRANSIT',
    },
    inspectionStatus: {
      type: String,
      enum: ['PENDING', 'PASSED', 'FAILED'],
      default: 'PENDING',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Shipment', shipmentSchema);
module.exports.SHIPMENT_STATUSES = STATUSES;
