"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const router = useRouter();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      setError("User is not logged in. Please log in to view your profile.");
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        const { data } = await axios.get(`/api/users/${userId}`);
        setUser(data.user);
      } catch (error) {
        setError("Error fetching user data.");
        console.error(error);
      }
    };

    const fetchUserPosts = async () => {
      try {
        const { data } = await axios.get(`/api/posts/user?userId=${userId}`);
        setPosts(data.posts);
      } catch (error) {
        setError("Error fetching user posts.");
        console.error(error);
      }
    };

    Promise.all([fetchUserData(), fetchUserPosts()]).finally(() => setLoading(false));
  }, [userId]);

  const handleLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.clear();
    router.push("/Login");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-gray-500 text-xl">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-red-500 text-xl">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-10 px-4 sm:px-8 lg:px-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-wide">Profile</h1>
          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-500 to-red-700 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            Logout 🚪
          </button>
        </div>

        <div className="bg-white/70 backdrop-blur-lg shadow-2xl rounded-2xl p-10 flex items-center space-x-8 transition-all hover:shadow-3xl">
          <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center text-4xl font-bold shadow-lg">
            {user.username[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-4xl font-bold uppercase text-gray-800">{user.username}</h1>
            <p className="text-xl text-gray-500">{user.email}</p>
            <p className="text-sm text-gray-400 mt-2">
              Member since {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>

        <h2 className="text-4xl font-bold text-gray-800 mt-12 mb-6">Your Posts</h2>
        {posts?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <div
                key={post._id}
                className="bg-white/80 backdrop-blur-lg shadow-xl rounded-lg p-6 border border-gray-200 hover:shadow-2xl transition transform hover:scale-105"
              >
          
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-md">
                    {post.name[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold uppercase text-gray-800">{post.name}</h3>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                
                <p className="text-gray-700 text-lg mb-4 leading-relaxed">{post.content}</p>

                
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <div>{post.likes.length} {post.likes.length === 1 ? "Like" : "Likes"}</div>
                  <button className="text-blue-500 hover:underline">💬 View Comments</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-xl text-center mt-6">You have not made any posts yet. ✍️</p>
        )}
      </div>
    </div>
  );
}
