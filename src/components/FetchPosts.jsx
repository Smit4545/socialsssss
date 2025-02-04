import axios from "axios";
import PostList from "./PostList"; // ✅ Import PostList
import CreatePost from "./CreatePost"; // ✅ Import CreatePost
// ✅ Fetch data on the server
export const fetchPosts = async () => {
  try {
    const { data } = await axios.get(`http://localhost:3000/api/posts/all`);
    return data.posts;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
};

export default async function FetchPosts() {
  const posts = await fetchPosts(); // Fetch posts on the server

  return (
    <div className="max-w-5xl mx-auto px-4 mt-8">
      {/* ✅ Create Post Form */}
      <CreatePost />

      {/* ✅ Render PostList (Client Component) */}
      <PostList initialPosts={posts} />
    </div>
  ); // Pass data to client component
}
