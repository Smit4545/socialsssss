import dbConnect from '../../../../dbconfig/db';
import FriendRequest from '../../../../models/FriendRequestModel';

export async function POST(req) {
  const { senderId, receiverId } = await req.json();
  
  // Logging request for debugging
  console.log("Sender ID:", senderId, "Receiver ID:", receiverId);
  
  try {
    await dbConnect();

    // Check if the sender and receiver are the same
    if (senderId === receiverId) {
      return new Response(
        JSON.stringify({ error: 'You cannot send a friend request to yourself' }),
        { status: 400 }
      );
    }

    // Check if there's an existing friend request or if they are already friends
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    });

    if (existingRequest) {
      return new Response(
        JSON.stringify({ message: 'Friend request already sent or already friends' }),
        { status: 201}
      );
    }

    // Create and save the new friend request
    const newRequest = new FriendRequest({
      senderId,
      receiverId,
      status: 'pending',
    });

    await newRequest.save();

    return new Response(
      JSON.stringify({ message: 'Friend request sent successfully' }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing friend request:", error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
}
