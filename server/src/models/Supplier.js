const mongoose = require('mongoose');

const STATUSES = ['PENDING', 'ACTIVE', 'SUSPENDED', 'BLACKLISTED', 'INACTIVE'];

const supplierSchema = new mongoose.Schema(
  {
    supplierId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    contactPersonName: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      required: [true, 'Supplier email is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zip: String,
    },
    category: [
      {
        type: String,
      },
    ],
    certifications: [
      {
        name: String,
        issuer: String,
        issueDate: Date,
        expiryDate: Date,
        verificationStatus: {
          type: String,
          enum: ['PENDING', 'VERIFIED', 'EXPIRED', 'REJECTED'],
          default: 'VERIFIED',
        },
      },
    ],
    yearsInBusiness: {
      type: Number,
      default: 5,
    },
    previousContractsCount: {
      type: Number,
      default: 0,
    },
    qualityScore: {
      type: Number,
      default: 85,
      min: 0,
      max: 100,
    },
    deliveryScore: {
      type: Number,
      default: 90,
      min: 0,
      max: 100,
    },
    complianceScore: {
      type: Number,
      default: 92,
      min: 0,
      max: 100,
    },
    riskScore: {
      type: Number,
      default: 15,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'ACTIVE',
    },
    aiEvaluation: {
      strengths: [String],
      concerns: [String],
      riskIndicators: [String],
      performanceSummary: String,
      missingInformation: [String],
      evaluatedAt: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Supplier', supplierSchema);
module.exports.SUPPLIER_STATUSES = STATUSES;
