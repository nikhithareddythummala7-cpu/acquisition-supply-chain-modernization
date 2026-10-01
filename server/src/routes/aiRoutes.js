const express = require('express');
const router = express.Router();
const {
  analyzeRequirementHandler,
  evaluateSupplierHandler,
  analyzeBidsHandler,
  analyzeContractHandler,
  analyzeRiskHandler,
} = require('../controllers/aiController');
const { handleRAGChat } = require('../controllers/ragController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/requirement-analysis', analyzeRequirementHandler);
router.post('/supplier-analysis', evaluateSupplierHandler);
router.post('/bid-analysis', analyzeBidsHandler);
router.post('/contract-analysis', analyzeContractHandler);
router.post('/risk-analysis', analyzeRiskHandler);
router.post('/chat', handleRAGChat);

module.exports = router;
