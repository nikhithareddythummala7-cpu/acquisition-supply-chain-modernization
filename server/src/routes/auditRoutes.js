const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', authorizeRoles('ADMIN', 'COMPLIANCE_AUDITOR', 'EXTERNAL_AUDITOR', 'SUPPLY_CHAIN_ANALYST'), getAuditLogs);

module.exports = router;
