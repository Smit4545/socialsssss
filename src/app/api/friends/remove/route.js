import dbConnect from '../../../../dbconfig/db';
import Friend from '../../../../models/FriendModel';

export async function POST(req, res) {
  const { userId, friendId } = req.body; 

  try {
  
    await dbConnect();

  
    const userFriend = await Friend.findOne({ userId });
    if (!userFriend) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the friend exists in the user's friend list
    const friendIndex = userFriend.friends.findIndex(friend => friend.userId.toString() === friendId);
    if (friendIndex === -1) {
      return res.status(404).json({ error: 'Friend not found in your friend list' });
    }

    // Remove the friend from the user's friend list
    userFriend.friends.splice(friendIndex, 1);
    await userFriend.save();

    // Find the friend's friend list to remove the user
    const friend = await Friend.findOne({ userId: friendId });
    if (!friend) {
      return res.status(404).json({ error: 'Friend not found' });
    }

    // Remove the user from the friend's friend list
    const userIndex = friend.friends.findIndex(f => f.userId.toString() === userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found in the friend\'s list' });
    }

    friend.friends.splice(userIndex, 1);
    await friend.save();

    return res.status(200).json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
