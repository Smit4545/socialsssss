// import mongoose from 'mongoose';

// let isConnected = false;

// const dbConnect = async () => {
//   if (isConnected) {
//     console.log('Database is already connected');
//     return;
//   }

//   try {
//     const db = await mongoose.connect("mongodb://localhost:27017/Social", {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });

//     isConnected = true;
//     console.log('Database connected successfully');
//   } catch (error) {
//     console.error('Database connection error:', error);
//     throw new Error('Database connection failed');
//   }
// };

// export default dbConnect;
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable.");
}

// Ensure caching for Next.js Hot Reloading
if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (global.mongoose.conn) return global.mongoose.conn;

  if (!global.mongoose.promise) {
    global.mongoose.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: "Social", // Ensure the correct database name
        bufferCommands: false,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then((mongoose) => {
        console.log("✅ Database connected successfully");
        return mongoose;
      })
      .catch((error) => {
        console.error("❌ Database connection error:", error);
        process.exit(1);
      });
  }

  global.mongoose.conn = await global.mongoose.promise;
  return global.mongoose.conn;
}

export default dbConnect;
