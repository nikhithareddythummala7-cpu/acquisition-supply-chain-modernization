const mongoose = require('mongoose');

const STATUSES = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'REJECTED', 'ACCEPTED', 'WITHDRAWN'];

const bidSubmissionSchema = new mongoose.Schema(
  {
    bidId: {
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
    vendorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    quotedPrice: {
      type: Number,
      required: [true, 'Quoted price is required'],
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    deliveryTimeDays: {
      type: Number,
      required: [true, 'Delivery time in days is required'],
      min: 1,
    },
    validityPeriodDate: {
      type: Date,
      required: [true, 'Validity period date is required'],
    },
    technicalProposal: {
      type: String,
      required: [true, 'Technical proposal is required'],
    },
    paymentTerms: {
      type: String,
      default: 'Net 30',
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
      default: 'SUBMITTED',
    },
    aiAnalysis: {
      costEvaluation: String,
      deliveryAssessment: String,
      supplierRiskScore: Number,
      recommendationNotes: String,
      analyzedAt: Date,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BidSubmission', bidSubmissionSchema);
module.exports.BID_STATUSES = STATUSES;
