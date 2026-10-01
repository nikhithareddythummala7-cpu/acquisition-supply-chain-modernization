const express = require('express');
const router = express.Router();
const {
  getContracts,
  getContractById,
  createContract,
  runAIContractAnalysis,
} = require('../controllers/contractController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getContracts);
router.post('/', authorizeRoles('ADMIN', 'CONTRACT_MANAGER'), createContract);
router.get('/:id', getContractById);
router.post('/:id/ai-analysis', runAIContractAnalysis);

module.exports = router;
