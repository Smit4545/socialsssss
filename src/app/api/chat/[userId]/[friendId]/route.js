import dbConnect from "../../../../../dbconfig/db";
import Chat from "../../../../../models/ChatModel";

export async function GET(req, { params }) {
  await dbConnect(); // Connect to the database

  const { userId, friendId } = params; // Extract userId and friendId properly

  if (!userId || !friendId) {
    return new Response(JSON.stringify({ success: false, error: "User IDs are required" }), {
      status: 400,
    });
  }

  try {
    // Fetch chat messages between the two users
    const chats = await Chat.find({
      $or: [
        { senderId: userId, receiverId: friendId },
        { senderId: friendId, receiverId: userId },
      ],
    }).sort({ createdAt: 1 }); // Sort messages from oldest to newest

    return new Response(JSON.stringify({ success: true, messages: chats }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching chat:", error);
    return new Response(JSON.stringify({ success: false, error: "Error fetching chats" }), {
      status: 500,
    });
  }
}

export async function POST(req, { params }) {
  await dbConnect(); // Connect to the database

  const { userId, friendId } = params; // Extract userId and friendId properly
  const { message } = await req.json(); // Parse JSON body

  if (!userId || !friendId) {
    return new Response(JSON.stringify({ success: false, error: "User IDs are required" }), {
      status: 400,
    });
  }

  if (!message || message.trim() === "") {
    return new Response(JSON.stringify({ success: false, error: "Message is required" }), {
      status: 400,
    });
  }

  try {
    // Save the new chat message
    const newChat = new Chat({
      senderId: userId,
      receiverId: friendId,
      message,
      createdAt: new Date(), // Ensure createdAt is set
    });

    await newChat.save();

    return new Response(JSON.stringify({ success: true, chat: newChat }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error saving chat:", error);
    return new Response(JSON.stringify({ success: false, error: "Error saving chat" }), {
      status: 500,
    });
  }
}
