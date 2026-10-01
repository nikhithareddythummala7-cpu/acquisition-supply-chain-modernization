const mongoose = require('mongoose');

const STATUSES = ['DRAFT', 'UNDER_REVIEW', 'PENDING_APPROVAL', 'ACTIVE', 'EXPIRED', 'TERMINATED', 'RENEWED'];

const supplyContractSchema = new mongoose.Schema(
  {
    contractNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    procurementRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProcurementRequirement',
      required: true,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Contract title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    contractValue: {
      type: Number,
      required: [true, 'Contract value is required'],
      min: 0,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    paymentTerms: {
      type: String,
      default: 'Milestone Payments - Net 30',
    },
    deliveryTerms: {
      type: String,
      default: 'FOB Destination',
    },
    penaltyTerms: {
      type: String,
      default: '1% per week delay up to 10%',
    },
    renewalTerms: {
      type: String,
      default: 'Subject to annual performance review',
    },
    documents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
      },
    ],
    status: {
      type: String,
      enum: STATUSES,
      default: 'ACTIVE',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    aiExtraction: {
      extractedValue: Number,
      extractedStartDate: Date,
      extractedEndDate: Date,
      penaltyClauseSummary: String,
      riskFlags: [String],
      obligationChecklist: [String],
      analyzedAt: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SupplyContract', supplyContractSchema);
module.exports.CONTRACT_STATUSES = STATUSES;
