const AuditTrail = require('../models/AuditTrail');

// @desc    Get immutable audit logs with search and filter
// @route   GET /api/audit
// @access  Private (ADMIN, COMPLIANCE_AUDITOR, EXTERNAL_AUDITOR)
const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 15, search = '', action = '', userRole = '' } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { userEmail: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
        { entityType: { $regex: search, $options: 'i' } },
      ];
    }

    if (action) query.action = action;
    if (userRole) query.userRole = userRole;

    const count = await AuditTrail.countDocuments(query);
    const auditLogs = await AuditTrail.find(query)
      .populate('userId', 'fullName email role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      message: 'Audit trail logs retrieved',
      data: {
        auditLogs,
        page: Number(page),
        pages: Math.ceil(count / limit),
        total: count,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAuditLogs };
