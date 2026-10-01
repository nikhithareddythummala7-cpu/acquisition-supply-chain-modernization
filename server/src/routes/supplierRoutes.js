const express = require('express');
const router = express.Router();
const {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  runAISupplierEvaluation,
  addSupplierContact,
} = require('../controllers/supplierController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getSuppliers);
router.post('/', authorizeRoles('ADMIN', 'PROCUREMENT_OFFICER'), createSupplier);
router.get('/:id', getSupplierById);
router.put('/:id', authorizeRoles('ADMIN', 'PROCUREMENT_OFFICER'), updateSupplier);
router.post('/:id/ai-evaluation', runAISupplierEvaluation);
router.post('/:id/contacts', authorizeRoles('ADMIN', 'PROCUREMENT_OFFICER', 'VENDOR'), addSupplierContact);

module.exports = router;
