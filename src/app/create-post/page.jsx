// pages/create-post.js

"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function CreatePost() {
  const [content, setContent] = useState("");
  const userId = localStorage.getItem("userId");
  const router = useRouter();

  const handleCreatePost = async () => {
    try {
      const response = await axios.post("http://localhost:3000/api/posts", {
        userId,
        content,
      });

      if (response.data.message) {
        alert("Post created successfully");
        router.push("/");  // Redirect back to the home page after post creation
      }
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Create a Post</h1>
      <textarea
        className="w-full p-4 border border-gray-300 rounded-lg mb-4"
        placeholder="Write your post content here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button
        onClick={handleCreatePost}
        className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
      >
        Create Post
      </button>
    </div>
  );
}
