import dbConnect from '../../../../dbconfig/db';
import Friend from '../../../../models/FriendModel';

export async function GET(req, { params }) {
  const { userId } = await params; 

  try {
    
    await dbConnect();

    const userFriends = await Friend.findOne({ userId });

    if (!userFriends) {
      return new Response(
        JSON.stringify({ friends: [] }),
        { status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ friends: userFriends.friends }),
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
