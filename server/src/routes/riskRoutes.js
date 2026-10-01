const express = require('express');
const router = express.Router();
const { getRisks, createRisk, runAIRiskAnalysis } = require('../controllers/riskController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getRisks);
router.post('/', authorizeRoles('ADMIN', 'RISK_SPECIALIST', 'SUPPLY_CHAIN_ANALYST'), createRisk);
router.post('/:id/ai-analysis', runAIRiskAnalysis);

module.exports = router;
