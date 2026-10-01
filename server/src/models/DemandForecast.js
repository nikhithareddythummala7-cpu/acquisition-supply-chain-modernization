const mongoose = require('mongoose');

const demandForecastSchema = new mongoose.Schema(
  {
    item: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    month: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    department: {
      type: String,
      default: 'Logistics',
    },
    location: {
      type: String,
      default: 'Central Supply Depot',
    },
    isForecast: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DemandForecast', demandForecastSchema);
