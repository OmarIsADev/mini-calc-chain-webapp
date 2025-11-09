import mongoose, { type Connection } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

declare global {
  // biome-ignore lint/suspicious/noRedeclare: .
  var mongoose: {
    conn: Connection | null;
    promise: Promise<typeof mongoose> | null;
  };
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
    // biome-ignore lint/style/noNonNullAssertion: .
    cached.promise = mongoose.connect(MONGODB_URI!).then((mongoose) => {
      return mongoose;
    }) as Promise<{
      conn: Connection | null;
      promise: Promise<typeof global.mongoose> | null;
    }>;

    const db: Connection = mongoose.connection;

    // Connection events

    db.on("connected", () => {
      console.log("✅ Mongoose connected successfully to MongoDB!");
    });

    // Error event
    db.on("error", (err) => {
      console.error(`❌ Mongoose connection error: ${err}`);
      // Log the error and consider exiting the application if critical
    });

    // Disconnection event
    db.on("disconnected", () => {
      console.log("⚠️ Mongoose disconnected from MongoDB.");
    });
  }
  cached.conn = (await cached.promise) as unknown as Connection;
  return cached.conn;
}

export default connectMongoDB;
