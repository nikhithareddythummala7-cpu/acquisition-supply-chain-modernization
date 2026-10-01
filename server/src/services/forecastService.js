const DemandForecast = require('../models/DemandForecast');

/**
 * Demand Forecasting Service
 */
const getDemandForecastData = async () => {
  const records = await DemandForecast.find({}).sort({ year: 1, month: 1 });
  
  if (records.length === 0) {
    // Generate standard default monthly historical & forecast baseline
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const historical = months.map((m, idx) => ({
      month: m,
      year: 2026,
      actual: 120 + Math.floor(Math.sin(idx) * 30 + idx * 5),
      forecast: 115 + Math.floor(idx * 5),
      category: 'Tactical Gear & Logistics',
    }));
    return historical;
  }

  return records;
};

module.exports = { getDemandForecastData };
