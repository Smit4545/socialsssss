import dbConnect from '../../../../dbconfig/db';
import FriendRequest from '../../../../models/FriendRequestModel';
import Friend from '../../../../models/FriendModel';
import User from '../../../../models/userModel'; 
import { ObjectId } from 'mongodb';

export async function POST(req) {
  const { userId, requestId } = await req.json(); 
  console.log(userId,requestId)

  try {
    
    await dbConnect();

    const friendRequest = await FriendRequest.findOne({ senderId: userId, receiverId: requestId });
    console.log("friendRequest",friendRequest)
    if (!friendRequest) {
      return new Response(
        JSON.stringify({ error: 'Friend request not found' }),
        { status: 404 }
      );
    }

    if (friendRequest.status !== 'pending') {
      return new Response(
        JSON.stringify({ error: 'This request has already been accepted or rejected' }),
        { status: 400 }
      );
    }

    // Check if the user is the receiver of the friend request
    if (friendRequest.receiverId.toString() !== requestId) {
      return new Response(
        JSON.stringify({ error: 'You cannot accept a request that was not sent to you' }),
        { status: 403 }
      );
    }

    friendRequest.status = 'accepted';
    await friendRequest.save();

    // Fetch user details (name) for both sender and receiver
    const sender = await User.findById(friendRequest.senderId);
    const receiver = await User.findById(friendRequest.receiverId);

    if (!sender || !receiver) {
      return new Response(
        JSON.stringify({ error: 'User details not found' }),
        { status: 404 }
      );
    }
    console.log("name",sender.username,receiver.username)
    if (!sender.username || !receiver.username) {
      return new Response(
        JSON.stringify({ error: 'Username for sender or receiver is missing' }),
        { status: 400 }
      );
    }

    const senderFriend = await Friend.findOne({ userId: friendRequest.senderId });
    const receiverFriend = await Friend.findOne({ userId: friendRequest.receiverId });

    // Add sender to receiver's friend list
    if (!senderFriend) {
      await Friend.create({
        userId: friendRequest.senderId,
        name:sender.username,
        friends: [{ userId: friendRequest.receiverId, name: receiver.username }] // Add the receiver's name
      });
    } else {
      senderFriend.friends.push({ userId: friendRequest.receiverId, name: receiver.username });
      await senderFriend.save();
    }

    // Add receiver to sender's friend list
    if (!receiverFriend) {
      await Friend.create({
        userId: friendRequest.receiverId,
        name:receiver.username,
        friends: [{ userId: friendRequest.senderId, name: sender.username }] 
      });
    } else {
      receiverFriend.friends.push({ userId: friendRequest.senderId, name: sender.username });
      await receiverFriend.save();
    }

    return new Response(
      JSON.stringify({ message: 'Friend request accepted and users are now friends' }),
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
