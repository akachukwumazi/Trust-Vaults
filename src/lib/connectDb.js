import mongoose from "mongoose";

const DATABASE_URL = process.env.DATABASE_URL;

console.log("DATABASE_URL environment variable loaded:", DATABASE_URL ? `${DATABASE_URL.substring(0, 30)}...` : "UNDEFINED");

if (!DATABASE_URL) {
  throw new Error("Please define the DATABASE_URL environment variable inside .env.local");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(DATABASE_URL, opts).then((mongooseInstance) => {
      console.log("Connected to MongoDB successfully");
      return mongooseInstance;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    console.error("Database connection promise failed:", e.message || e);
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;


