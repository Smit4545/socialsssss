import mongoose from 'mongoose';
import User from "../models/userModel"
const friendSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    friends: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: User,
          required: true,
        },
        name: {
          type: String,
        
        },
      },
    ],
  },
  {
    timestamps: true, 
  }
);

const Friend = mongoose.models.Friend || mongoose.model('Friend', friendSchema);

export default Friend;
