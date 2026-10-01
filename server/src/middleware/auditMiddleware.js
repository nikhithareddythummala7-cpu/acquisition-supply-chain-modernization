const AuditTrail = require('../models/AuditTrail');

const logAudit = async ({ req, action, entityType = '', entityId = '', oldValue = null, newValue = null, status = 'SUCCESS' }) => {
  try {
    const userId = req && req.user ? req.user._id : null;
    const userEmail = req && req.user ? req.user.email : (req && req.body && req.body.email ? req.body.email : 'system');
    const userRole = req && req.user ? req.user.role : 'GUEST';
    const ipAddress = (req && req.ip) || (req && req.headers && req.headers['x-forwarded-for']) || '127.0.0.1';
    const userAgent = (req && typeof req.get === 'function' && req.get('User-Agent')) || '';

    await AuditTrail.create({
      userId,
      userEmail,
      userRole,
      action,
      entityType,
      entityId,
      oldValue,
      newValue,
      ipAddress,
      userAgent,
      status,
    });
  } catch (err) {
    console.error('Audit Logging Error:', err.message);
  }
};

module.exports = { logAudit };
