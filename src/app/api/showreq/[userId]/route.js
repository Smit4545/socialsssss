// /pages/api/friendrequests/[userId].js

import dbConnect from '../../../../dbconfig/db';
import FriendRequest from '../../../../models/FriendRequestModel';
import User from "../../../../models/userModel";

export async function GET(req, { params }) {
  const { userId } = await params;

  try {
    await dbConnect();

    // Get all pending friend requests where the user is the receiver
    const pendingRequests = await FriendRequest.find({
      receiverId: userId,
      status: 'pending',
    });
    console.log(pendingRequests)
    if (!pendingRequests.length) {
      return new Response(
        JSON.stringify({ message: 'No pending friend requests found' }),
        { status: 200 }
      );
    }
    const senderIds = pendingRequests.map(request => request.senderId);
    const users=await User.find({_id:{$in:senderIds}});
    return new Response(
      JSON.stringify({ pendingRequests, users }),
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
