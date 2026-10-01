const express = require('express');
const router = express.Router();
const {
  getBids,
  submitBid,
  getBidComparison,
  runAIBidAnalysis,
} = require('../controllers/bidController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getBids);
router.post('/', authorizeRoles('ADMIN', 'PROCUREMENT_OFFICER', 'VENDOR'), submitBid);
router.get('/comparison/:procurementRequestId', getBidComparison);
router.post('/ai-analysis', runAIBidAnalysis);

module.exports = router;
