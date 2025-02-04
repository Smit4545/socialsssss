import mongoose from 'mongoose';

const friendRequestSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending', 
    },
  },
  {
    timestamps: true,
  }
);

const FriendRequest = mongoose.models.FriendRequest || mongoose.model('FriendRequest', friendRequestSchema);

export default FriendRequest;
