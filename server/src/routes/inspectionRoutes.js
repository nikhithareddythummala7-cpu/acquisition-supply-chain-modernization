const express = require('express');
const router = express.Router();
const { getInspections, createInspection } = require('../controllers/inspectionController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getInspections);
router.post('/', authorizeRoles('ADMIN', 'SUPPLY_CHAIN_ANALYST', 'COMPLIANCE_AUDITOR', 'OPERATIONS_COMMANDER'), createInspection);

module.exports = router;
