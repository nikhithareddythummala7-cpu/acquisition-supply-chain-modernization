const { getDemandForecastData } = require('../services/forecastService');
const { detectAnomalies } = require('../services/anomalyService');

// @desc    Get Demand Forecast Analytics
// @route   GET /api/analytics/forecast
// @access  Private
const getDemandForecast = async (req, res, next) => {
  try {
    const forecastData = await getDemandForecastData();
    res.status(200).json({
      success: true,
      message: 'Demand forecast analytics generated',
      data: forecastData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Detected Supply Chain Anomalies
// @route   GET /api/analytics/anomalies
// @access  Private
const getAnomalies = async (req, res, next) => {
  try {
    const anomalies = await detectAnomalies();
    res.status(200).json({
      success: true,
      message: 'Detected supply chain anomalies loaded',
      data: anomalies,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDemandForecast, getAnomalies };
