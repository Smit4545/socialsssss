import dbConnect from '../../../../../dbconfig/db';
import Chat from '../../../../../models/ChatModel';

export async function GET(req, { params }) {
  const {userId,friendId } = await params; 
  //const userId = req.nextUrl.searchParams.get('userId'); // Get userId from query parameters

  await dbConnect(); // Connect to the database

  try {
    // Fetch chat messages between two users
    const chats = await Chat.find({
      $or: [
        { senderId: userId, receiverId: friendId },
        { senderId: friendId, receiverId: userId },
      ],
    }).sort({ createdAt: 1 }); // Sort by oldest first

    return new Response(JSON.stringify({ success: true, messages: chats }), {
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: 'Error fetching chats' }),
      { status: 500 }
    );
  }
}

// Handle POST Request (Save Chat Message)
export async function POST(req, { params }) {
  const { userId,friendId } = await params; // Get friendId from dynamic route
  const {  message } = await req.json(); // Parse JSON body

  await dbConnect(); // Connect to the database

  if (!message) {
    return new Response(
      JSON.stringify({ success: false, error: 'Message is required' }),
      { status: 400 }
    );
  }

  try {
    // Save the new chat message
    const newChat = new Chat({
      userId,
      senderId: userId,
      receiverId: friendId,
      message,
    });

    await newChat.save();

    return new Response(JSON.stringify({ success: true, chat: newChat }), {
      status: 201,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: 'Error saving chat' }),
      { status: 500 }
    );
  }
}
