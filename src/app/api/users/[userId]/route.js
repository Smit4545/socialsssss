import dbConnect from "../../../../dbconfig/db";
import User from "../../../../models/userModel";

export async function GET(req, { params }) {
  const { userId } =await params;
  console.log(userId)
  try {
    await dbConnect();
    const user = await User.findById(userId);
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }
    return new Response(JSON.stringify({ user }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
