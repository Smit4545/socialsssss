"use client";

import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

export default function CreatePost({ onPostCreated }) {
  const [newPostContent, setNewPostContent] = useState("");

  const handleCreatePost = async (e) => {
    e.preventDefault();

    try {
      const token = Cookies.get("token");
      if (!token) return alert("Please login first");

      const { data } = await axios.post("/api/posts", {
        userId: localStorage.getItem("userId"),
        content: newPostContent,
      });

      setNewPostContent("");
      onPostCreated(data.post); // ✅ Pass new post to parent component
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  return (
    <form onSubmit={handleCreatePost} className="bg-white p-6 rounded-lg shadow-xl mb-8">
      <textarea
        value={newPostContent}
        onChange={(e) => setNewPostContent(e.target.value)}
        placeholder="What's on your mind?"
        rows="4"
        className="w-full border-2 border-gray-300 rounded-lg p-4 mb-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
      />
      <button
        type="submit"
        disabled={!newPostContent}
        className={`w-full px-4 py-2 rounded-lg font-semibold text-white focus:outline-none ${
          newPostContent ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        Post
      </button>
    </form>
  );
}
