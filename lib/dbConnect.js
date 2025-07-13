import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGO_URL;
const DB_NAME = process.env.DB_NAME || 'breakly_db';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGO_URL environment variable');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: DB_NAME,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('Connected to MongoDB:', DB_NAME);
      return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export default dbConnect;