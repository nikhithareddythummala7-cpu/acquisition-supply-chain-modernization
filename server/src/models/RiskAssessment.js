const mongoose = require('mongoose');

const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const STATUSES = ['IDENTIFIED', 'MITIGATING', 'RESOLVED', 'MONITORING'];

const riskAssessmentSchema = new mongoose.Schema(
  {
    riskId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    relatedEntityType: {
      type: String,
      enum: ['Supplier', 'ProcurementRequirement', 'Shipment', 'SupplyContract'],
      required: true,
    },
    relatedEntityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    supplierRisk: {
      type: Number,
      default: 20,
      min: 0,
      max: 100,
    },
    deliveryRisk: {
      type: Number,
      default: 20,
      min: 0,
      max: 100,
    },
    qualityRisk: {
      type: Number,
      default: 15,
      min: 0,
      max: 100,
    },
    complianceRisk: {
      type: Number,
      default: 10,
      min: 0,
      max: 100,
    },
    financialRisk: {
      type: Number,
      default: 15,
      min: 0,
      max: 100,
    },
    operationalRisk: {
      type: Number,
      default: 20,
      min: 0,
      max: 100,
    },
    overallRisk: {
      type: String,
      enum: SEVERITIES,
      default: 'LOW',
    },
    riskFactors: [
      {
        type: String,
      },
    ],
    mitigationActions: [
      {
        type: String,
      },
    ],
    aiRiskAnalysis: {
      causes: [String],
      impact: String,
      warningSigns: [String],
      recommendedSteps: [String],
      analyzedAt: Date,
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'IDENTIFIED',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RiskAssessment', riskAssessmentSchema);
module.exports.RISK_SEVERITIES = SEVERITIES;
module.exports.RISK_STATUSES = STATUSES;
