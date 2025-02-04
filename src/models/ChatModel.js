// models/Chat.js

import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true }, // Logged-in user's ID
    senderId: { type: String, required: true }, // Sender's ID
    receiverId: { type: String, required: true }, // Receiver's ID
    message: { type: String, required: true }, // Message content
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

const Message= mongoose.models.Chat || mongoose.model('Chat', ChatSchema);
export default Message