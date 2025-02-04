"use client";

import axios from "axios";
import { use, useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import Cookies from "js-cookie";
import { fetchPosts } from "./FetchPosts";

export default function PostList({ initialPosts }) {
  const [posts, setPosts] = useState(initialPosts);
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  // ✅ Function to handle new post addition
  const addNewPost = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]); // Prepend new post
  };


    
  const handleLike = async (postId) => {
    try {
      const token = Cookies.get("token");
      if (!token) return alert("Please login first");

      const response = await axios.post(`/api/posts/${postId}`, { userId });
      console.log(response.data.post.likes)
      fetchPosts();
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? { ...post, likes: [...post.likes, response.data.userId] }
            : post
        )
      );
    } catch (error) {
      console.error("Error liking the post:", error);
    }
  };

  

  return (
    <main className="space-y-8">
      {posts.length > 0 ? (
        posts.map((post) => (
          <div
            key={post._id}
            className="bg-gray-100 shadow-xl rounded-lg p-6 transition-all transform hover:scale-105 hover:shadow-2xl"
          >
            {/* Post Header */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-wheat rounded-full flex items-center justify-center font-bold uppercase text-gray-700">
                {post.name[0].toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-semibold uppercase text-gray-800">{post.name}</h2>
                <p className="text-gray-500 text-sm">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>

            {/* Post Content */}
            <p className="text-gray-700 mt-4 text-lg leading-relaxed">{post.content}</p>

            {/* Footer: Likes */}
            <div className="flex justify-between items-center mt-6">
              <div className="flex items-center text-gray-600 text-sm">
                {post.likes.length} {post.likes.length === 1 ? "Like" : "Likes"}
              </div>
              <button
                onClick={() => handleLike(post._id)}
                className={`px-6 py-2 rounded-full focus:outline-none transition-all duration-300 ${
                  post.likes.includes(userId)
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-600"
                }`}
              >
                <span className="text-xl">{post.likes.includes(userId) ? "❤️" : "🤍"}</span> Like
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-center text-lg">No posts available.</p>
      )}
    </main>
  );
}
