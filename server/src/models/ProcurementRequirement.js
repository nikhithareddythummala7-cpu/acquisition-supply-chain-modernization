const mongoose = require('mongoose');

const STATUSES = [
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED',
  'SUPPLIER_EVALUATION',
  'BIDDING',
  'CONTRACTING',
  'COMPLETED',
  'CANCELLED'
];

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const procurementRequirementSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: 1,
    },
    unitOfMeasure: {
      type: String,
      default: 'Units',
    },
    specifications: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    estimatedBudget: {
      type: Number,
      required: [true, 'Estimated budget is required'],
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    requiredDate: {
      type: Date,
      required: [true, 'Required date is required'],
    },
    priority: {
      type: String,
      enum: PRIORITIES,
      default: 'MEDIUM',
    },
    department: {
      type: String,
      default: 'Procurement & Logistics',
    },
    complianceRequirements: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: STATUSES,
      default: 'DRAFT',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    aiAnalysis: {
      category: String,
      keyRequirements: [String],
      missingInformation: [String],
      evaluationCriteria: [String],
      potentialRisks: [String],
      complianceConsiderations: [String],
      priorityInterpretation: String,
      analyzedAt: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProcurementRequirement', procurementRequirementSchema);
module.exports.PROCUREMENT_STATUSES = STATUSES;
module.exports.PROCUREMENT_PRIORITIES = PRIORITIES;
