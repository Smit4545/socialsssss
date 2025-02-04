import dbConnect from '../../../../dbconfig/db';
import Post from '../../../../models/PostModel';

export async function POST(req, { params }) {
  const { id } = await params; 
  const { userId } = await req.json(); 

  try {
    await dbConnect();

    const post = await Post.findById(id);
    if (!post) {
      return new Response(JSON.stringify({ error: 'Post not found' }), { status: 404 });
    }

    const index = post.likes.indexOf(userId);
    if (index === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(index, 1);
    }

    await post.save();

    return new Response(JSON.stringify({ message: 'Post updated successfully', post }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
