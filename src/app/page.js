"use client";

import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Layout from "../components/Layout";
import { toast } from "react-hot-toast"; // Import toast for notifications

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true); // Initial loading state
  const [newPostContent, setNewPostContent] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef(null);

  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const router = useRouter();
  const [hasToken, setHasToken] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const token = Cookies.get("token");

  useEffect(() => {
    setInterval(() => {
      if (token) {
        setHasToken(true);
      }
      setIsReady(true);
    }, 1000);
  }, [token]);

  const fetchPosts = async () => {
    try {
      const { data } = await axios.get("/api/posts/all");
      setPosts(data.posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false); // Hide loading spinner after data is fetched
    }
  };

  useEffect(() => {
    if (!userId || !hasToken || !isReady) return;
    fetchPosts();
  }, [userId, hasToken, isReady]);

  const handleLike = async (postId) => {
    try {
      const response = await axios.post(`/api/posts/${postId}`, {
        userId,
      });
      fetchPosts();
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? { ...post, likes: [...post.likes, response.data.userId] } : post
        )
      );
    } catch (error) {
      console.error("Error liking the post:", error);
    }
  };

  // const handleCreatePost = async (e) => {
  //   e.preventDefault();

  //   try {
  //     await axios.post("/api/posts", {
  //       userId,
  //       content: newPostContent,
  //     });
  //     setNewPostContent("");
  //     fetchPosts();
  //     setIsModalOpen(false);
  //     toast.success("Post created successfully!"); // Success toast
  //   } catch (error) {
  //     console.error("Error creating post:", error);
  //     toast.error("Error creating post"); // Error toast
  //   }
  // };

  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (modalRef.current && !modalRef.current.contains(event.target)) {
  //       setIsModalOpen(false);
  //     }
  //   };

  //   if (isModalOpen) {
  //     document.addEventListener("mousedown", handleClickOutside);
  //   } else {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   }

  //   return () => document.removeEventListener("mousedown", handleClickOutside);
  // }, [isModalOpen]);

  return (
    <Layout>
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
        </div>
      ) : null}
      <div className="bg-reddd min-h-screen relative">
        {/* Floating Create Post Button
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed top-16 right-6 bg-gray-900 text-white px-4 py-1 rounded-full shadow-lg hover:bg-wheat transition z-50"
        >
          ➕
        </button>

        {/* Modal (Ensuring it's in front) */}
        {/* {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div
              ref={modalRef}
              className="bg-white p-6 rounded-2xl shadow-2xl max-w-lg w-full transition-all relative z-50"
            >
              <h2 className="text-xl font-bold mb-4">Create a New Post</h2>
              <form onSubmit={handleCreatePost}>
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="What's on your mind?"
                  rows="4"
                  className="w-full border border-gray-300 rounded-xl p-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <div className="flex justify-end gap-4 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-300 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newPostContent}
                    className={`px-6 py-2 rounded-lg text-white ${
                      newPostContent
                        ? "bg-gray-900 hover:bg-blue-600"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Post
                  </button>
                </div>
              </form>
            </div>
          </div>
        )} */}

        {/* Feed Section */}
        <main className="max-w-5xl mx-auto px-4 space-y-8 mt-8 relative z-10">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div
                key={post._id}
                className={`bg-gray-100 shadow-xl rounded-lg p-6 transition-all transform hover:scale-105 hover:shadow-2xl ${
                  post.likes.includes(userId)
                    ? "font-black border-8 border-white bg-slate-800 text-white"
                    : //    ? "border-8 border-red-500 bg-red-300 font-black"
                      "font-black border-8 border-white bg-slate-800 text-white"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-16 h-16 text-black rounded-full text-xl flex items-center justify-center font-bold uppercase ${
                      post.likes.includes(userId) ? "bg-wheat" : "bg-wheat"
                    }`}
                  >
                    {post.name[0].toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold uppercase">{post.name}</h2>
                    <p className="text-sm">
                      {formatDistanceToNow(new Date(post.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-lg leading-relaxed">{post.content}</p>

                <div className="flex justify-between items-center mt-6">
                  <div className="flex items-center text-lg font-semibold">
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
                    <span className="text-xl">{post.likes.includes(userId) ? "❤️" : "🤍"}</span>{" "}
                    Like
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center text-lg">No posts available.</p>
          )}
        </main>
      </div>
    </Layout>
  );
}
