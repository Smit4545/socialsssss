import dbConnect from "../../../dbconfig/db"; // Your database connection
import User from "../../../models/userModel"; // Your User model
import Friend from "../../../models/FriendModel"; // Your Friend model

export async function GET(req) {
  // Connect to the database
  await dbConnect();

  try {
    const userId = req.headers.get("user-id"); // Assuming the logged-in user's ID is passed in the header
    console.log("userId:", userId);
    // if (!userId) {
    //   return new Response(
    //     JSON.stringify({ error: "User ID is required" }),
    //     { status: 400 }
    //   );
    // }

    // Fetch the logged-in user's friend data
    const friendData = await Friend.findOne({ userId });

    // Extract IDs of friends
    const friendIds = friendData
      ? friendData.friends.map((friend) => friend.userId.toString())
      : [];

    console.log("friendIds:", friendIds);

    // Fetch all users who are NOT friends and NOT the logged-in user
    const users = await User.find({
      _id: { $nin: [userId, ...friendIds] }, // Exclude the logged-in user and their friends
    }).select("-password"); // Exclude password field from the results

    console.log("users:", users);
    // Send the response with the filtered users
    return new Response(
      JSON.stringify({
        users,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return new Response(JSON.stringify({ error: "Error fetching users" }), { status: 500 });
  }
}
