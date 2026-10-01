const express = require('express');
const router = express.Router();
const { getDashboardStats, getSupplyChainDashboardStats } = require('../controllers/dashboardController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/stats', protect, getDashboardStats);
router.get(
  '/supply-chain-stats',
  protect,
  authorizeRoles('ADMIN', 'SUPPLY_CHAIN_ANALYST', 'OPERATIONS_COMMANDER'),
  getSupplyChainDashboardStats
);

module.exports = router;
