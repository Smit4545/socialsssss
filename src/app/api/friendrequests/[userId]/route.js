import dbConnect from '../../../../dbconfig/db';
import FriendRequest from '../../../../models/FriendRequestModel';

export async function GET(req,{params}) {
  const { userId } = await params; 

  try {
    await dbConnect();

    const pendingRequests = await FriendRequest.find({
      senderId: userId,
      status: 'pending',
    });

    if (!pendingRequests.length) {
      return new Response(
        JSON.stringify({ message: 'No pending friend requests found' }),
        { status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ pendingRequests }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
}
