import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectMongoDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
      return mongoose;
    });

    const db = mongoose.connection;
    
    // Connection events
    

    db.on('connected', () => {
      console.log('✅ Mongoose connected successfully to MongoDB!');
    });
    
    // Error event
    db.on('error', (err) => {
      console.error(`❌ Mongoose connection error: ${err}`);
      // Log the error and consider exiting the application if critical
    });
    
    // Disconnection event
    db.on('disconnected', () => {
      console.log('⚠️ Mongoose disconnected from MongoDB.');
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectMongoDB;
