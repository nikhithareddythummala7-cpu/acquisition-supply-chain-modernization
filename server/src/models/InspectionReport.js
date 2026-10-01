const mongoose = require('mongoose');

const STATUSES = ['PENDING', 'PASSED', 'PARTIAL_PASS', 'FAILED'];

const inspectionReportSchema = new mongoose.Schema(
  {
    inspectionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    shipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shipment',
      required: true,
    },
    inspector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    inspectionDate: {
      type: Date,
      default: Date.now,
    },
    receivedQuantity: {
      type: Number,
      required: true,
    },
    acceptedQuantity: {
      type: Number,
      required: true,
    },
    rejectedQuantity: {
      type: Number,
      default: 0,
    },
    qualityStatus: {
      type: String,
      enum: STATUSES,
      default: 'PASSED',
    },
    defects: [
      {
        type: String,
      },
    ],
    notes: {
      type: String,
      default: '',
    },
    documents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('InspectionReport', inspectionReportSchema);
module.exports.INSPECTION_STATUSES = STATUSES;
