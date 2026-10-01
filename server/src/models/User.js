const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = [
  'ADMIN',
  'PROCUREMENT_OFFICER',
  'SUPPLY_CHAIN_ANALYST',
  'COMPLIANCE_AUDITOR',
  'VENDOR',
  'CONTRACT_MANAGER',
  'OPERATIONS_COMMANDER',
  'RISK_SPECIALIST',
  'EXTERNAL_AUDITOR'
];

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    organization: {
      type: String,
      trim: true,
      default: 'Department of Logistics & Defense',
    },
    role: {
      type: String,
      enum: ROLES,
      default: 'PROCUREMENT_OFFICER',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Password hash middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
module.exports.ROLES = ROLES;
