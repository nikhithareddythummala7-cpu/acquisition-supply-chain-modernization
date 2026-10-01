const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/acquisition_system');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // If local MongoDB is not running, log explicit guidance but don't exit process in dev test mode
    if (process.env.NODE_ENV === 'test') {
      console.warn('Continuing execution in test/fallback mode...');
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
