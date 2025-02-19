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
// import mongoose from "mongoose";

// const MONGODB_URI = process.env.MONGO_URI;

// if (!MONGODB_URI) {
//   throw new Error("❌ Please define the MONGO_URI environment variable.");
// }

// // Ensure global caching for Next.js Fast Refresh
// let cached = globalThis.mongoose || { conn: null, promise: null };
// globalThis.mongoose = cached;

// async function dbConnect() {
//   if (cached.conn) return cached.conn;

//   if (!cached.promise) {
//     cached.promise = mongoose
//       .connect(MONGODB_URI, {
//         dbName: "Social", // Make sure this matches your MongoDB database name
//         bufferCommands: false,
//       })
//       .then((mongoose) => {
//         console.log("✅ MongoDB Connected Successfully");
//         return mongoose;
//       })
//       .catch((error) => {
//         console.error("❌ MongoDB Connection Failed:", error);
//         process.exit(1); // Exit process on failure
//       });
//   }

//   cached.conn = await cached.promise;
//   return cached.conn;
// }

// export default dbConnect;
import mongoose from "mongoose";

let isConnected = false;

const dbConnect = async () => {
  if (isConnected) {
    console.log("Database is already connected");
    return;
  }

  try {
    const db = await mongoose.connect(`${process.env.MONGO_URI}`, {
      dbName: "Social",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = true;
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection error:", error);
    throw new Error("Database connection failed");
  }
};

export default dbConnect;
