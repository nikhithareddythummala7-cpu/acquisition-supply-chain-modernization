const mongoose = require('mongoose');

const STATUSES = ['PENDING', 'VERIFIED', 'EXPIRED', 'REJECTED'];

const complianceRecordSchema = new mongoose.Schema(
  {
    complianceId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    requiredCertification: {
      type: String,
      required: true,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true,
    },
    contractId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SupplyContract',
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    verificationStatus: {
      type: String,
      enum: STATUSES,
      default: 'VERIFIED',
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

module.exports = mongoose.model('ComplianceRecord', complianceRecordSchema);
module.exports.COMPLIANCE_STATUSES = STATUSES;
