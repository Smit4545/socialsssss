import dbConnect from '../../../../dbconfig/db';
import Post from '../../../../models/PostModel';


export async function GET(req) {
    if (req.method === 'GET') {
      try {
        
        await dbConnect();
  
        const posts = await Post.find().sort({ createdAt: -1 });
  
        return new Response(
          JSON.stringify({ posts }),
          { status: 200 }
        );
      } catch (error) {
        console.error(error);
        return new Response(
          JSON.stringify({ error: 'Internal server error' }),
          { status: 500 }
        );
      }
    } else {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405 }
      );
    }
  }