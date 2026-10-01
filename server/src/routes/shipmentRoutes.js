const express = require('express');
const router = express.Router();
const { getShipments, createShipment, updateShipment } = require('../controllers/shipmentController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getShipments);
router.post('/', authorizeRoles('ADMIN', 'SUPPLY_CHAIN_ANALYST', 'OPERATIONS_COMMANDER', 'VENDOR'), createShipment);
router.put('/:id', authorizeRoles('ADMIN', 'SUPPLY_CHAIN_ANALYST', 'OPERATIONS_COMMANDER'), updateShipment);

module.exports = router;
