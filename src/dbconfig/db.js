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

let cached = global.mongoose || { conn: null, promise: null };

async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: "Social",
        bufferCommands: false,
      })
      .then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  console.log("Database connected successfully");
  return cached.conn;
}

export default dbConnect;
