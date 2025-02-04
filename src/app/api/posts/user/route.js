import dbConnect from '../../../../dbconfig/db';
import Post from '../../../../models/PostModel';


export async function GET(req) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    console.log("userId:", userId);

    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId is required' }), { status: 400 });
    }
    await dbConnect();

    const posts = await Post.find({ userId }).populate('userId', 'name').sort({ createdAt: -1 });

    if (!posts.length) {
      return new Response(JSON.stringify({ message: 'No posts found for this user' }), { status: 200 });
    }

    return new Response(JSON.stringify({ posts }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

