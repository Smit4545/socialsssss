import mongoose from 'mongoose';

let isConnected = false;

const dbConnect = async () => {
  if (isConnected) {
    console.log('Database is already connected');
    return;
  }

  try {
    const db = await mongoose.connect("mongodb://localhost:27017/Social", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = true;
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    throw new Error('Database connection failed');
  }
};

export default dbConnect;
