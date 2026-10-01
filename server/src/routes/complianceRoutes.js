const express = require('express');
const router = express.Router();
const { getComplianceRecords, createComplianceRecord } = require('../controllers/complianceController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getComplianceRecords);
router.post('/', createComplianceRecord);

module.exports = router;
