const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');

// Load Environment Variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Security & Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AI Acquisition & Supply Chain API Server is operational',
    timestamp: new Date(),
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/procurement', require('./routes/procurementRoutes'));
app.use('/api/suppliers', require('./routes/supplierRoutes'));
app.use('/api/bids', require('./routes/bidRoutes'));
app.use('/api/contracts', require('./routes/contractRoutes'));
app.use('/api/shipments', require('./routes/shipmentRoutes'));
app.use('/api/inspections', require('./routes/inspectionRoutes'));
app.use('/api/risks', require('./routes/riskRoutes'));
app.use('/api/compliance', require('./routes/complianceRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/audit', require('./routes/auditRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// 404 Route Handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Centralized Error Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

module.exports = app;
