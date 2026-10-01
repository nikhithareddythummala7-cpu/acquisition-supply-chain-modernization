const express = require('express');
const router = express.Router();
const {
  getProcurementRequirements,
  getProcurementRequirementById,
  createProcurementRequirement,
  updateProcurementRequirement,
  updateRequirementStatus,
  runAIRequirementAnalysis,
  deleteProcurementRequirement,
} = require('../controllers/procurementController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getProcurementRequirements);
router.post('/', authorizeRoles('ADMIN', 'PROCUREMENT_OFFICER'), createProcurementRequirement);
router.get('/:id', getProcurementRequirementById);
router.put('/:id', authorizeRoles('ADMIN', 'PROCUREMENT_OFFICER'), updateProcurementRequirement);
router.delete('/:id', authorizeRoles('ADMIN'), deleteProcurementRequirement);
router.patch('/:id/status', authorizeRoles('ADMIN', 'PROCUREMENT_OFFICER'), updateRequirementStatus);
router.post('/:id/ai-analysis', runAIRequirementAnalysis);

module.exports = router;
