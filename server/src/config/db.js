import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/drone_navigation';
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected to database: ${mongoose.connection.name} at ${mongoose.connection.host}`);
    return true;
  } catch (error) {
    console.error('[MongoDB] Connection error:', error.message);
    console.warn('[MongoDB] Server will continue with fallback in-memory telemetry if DB is temporarily unreachable.');
    return false;
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Lost connection to MongoDB.');
});

mongoose.connection.on('reconnected', () => {
  console.log('[MongoDB] Reconnected to MongoDB.');
});
