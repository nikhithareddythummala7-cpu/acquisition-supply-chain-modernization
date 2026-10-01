const express = require('express');
const router = express.Router();
const { getDemandForecast, getAnomalies } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/forecast', getDemandForecast);
router.get('/anomalies', getAnomalies);

module.exports = router;
