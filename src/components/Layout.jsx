"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import axios from "axios";
import Cookies from "js-cookie";
import Image from "next/image";
import { useRouter } from "next/navigation";
import LogoutSharpIcon from "@mui/icons-material/LogoutSharp";
import Badge from "@mui/material/Badge";
import MailIcon from "@mui/icons-material/Mail";
import AccountBoxOutlinedIcon from "@mui/icons-material/AccountBoxOutlined";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import CheckIcon from "@mui/icons-material/Check";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import Tooltip from "@mui/material/Tooltip";
import AddIcon from "@mui/icons-material/Add";

export default function Layout({ children }) {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isFriendRequestsOpen, setFriendRequestsOpen] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [name, setName] = useState({});
  const [hasToken, setHasToken] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentChildren, setCurrentChildren] = useState(children);
  const [newPostContent, setNewPostContent] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef(null);
  const router = useRouter();

  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  useEffect(() => {
    const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    if (userId) {
      setHasToken(true);
    }
    setIsReady(true);
  }, [window.location.pathname]);

  useEffect(() => {
    if (window.location.pathname === "/") {
      setHasToken(true);
    }
  }, [hasToken]);

  useEffect(() => {
    setCurrentChildren(children);
  }, [children]);

  useEffect(() => {
    if (!userId || !hasToken || !isReady) return;

    const fetchPendingRequests = async () => {
      try {
        const res = await axios.get(`/api/showreq/${userId}`);
        setPendingRequests(res.data.pendingRequests || []);
        const senderNames = {};
        res.data.users?.forEach((user) => {
          senderNames[user._id] = user.username;
        });
        setName(senderNames);
      } catch (error) {
        console.error("Error fetching pending friend requests:", error);
      }
    };

    fetchPendingRequests();
  }, [userId, hasToken, isReady]);

  const handleAcceptRequest = async (senderId) => {
    try {
      const res = await axios.post("/api/friendrequests/accept", {
        userId: senderId,
        requestId: userId,
      });

      setMessage(res.data.message);

      setPendingRequests((prevRequests) =>
        prevRequests.filter((request) => request.senderId !== senderId)
      );
    } catch (error) {
      console.error("Error accepting friend request:", error);
      setMessage("Error accepting friend request");
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  const toggleFriendRequests = () => {
    setFriendRequestsOpen(!isFriendRequestsOpen);
  };

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("userId");
    localStorage.removeItem("userId");
    setHasToken(false);
    router.push("/Login");
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();

    try {
      await axios.post("/api/posts", {
        userId,
        content: newPostContent,
      });
      setNewPostContent("");
      fetchPosts();
      setIsModalOpen(false);
      toast.success("Post created successfully!"); // Success toast
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Error creating post"); // Error toast
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isModalOpen]);

  return (
    <div className="min-h-screen  flex flex-col">
      <header className="bg-redd text-white px-6 py-3 flex items-center justify-between shadow-lg">
        {/* Logo & Branding */}
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/logo2.webp"
            alt="Socialsssss Logo"
            width={75}
            height={75}
            className="rounded-full"
          />
          <span className="text-3xl font-extrabold hidden md:inline">Socialsssss</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-6">
          <Tooltip title="Friends" arrow>
            <Link href="/friends">
              <PeopleAltIcon
                className="text-white hover:text-gray-300"
                style={{ height: "40px", width: "50px" }}
              />
            </Link>
          </Tooltip>
          <Tooltip title="Profile" arrow>
            <Link href="/profile">
              <AccountBoxOutlinedIcon
                className="text-white hover:text-gray-300"
                style={{ height: "40px", width: "50px" }}
              />
            </Link>
          </Tooltip>
          <Tooltip title="Location" arrow>
            <Link href="/location">
              <LocationOnIcon
                className="text-white hover:text-gray-300"
                style={{ height: "40px", width: "50px" }}
              />
            </Link>
          </Tooltip>
        </nav>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Create Post Button */}
          {hasToken && userId && (
            <>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-black rounded-lg font-bold hover:bg-gray-800"
              >
                <Tooltip title="Create Post" arrow>
                  <AddIcon
                    className="text-white hover:text-gray-300"
                    style={{ height: "40px", width: "50px" }}
                  />
                </Tooltip>
              </button>

              {/* Modal for Creating Post */}
              {isModalOpen && (
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
                          className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!newPostContent}
                          className={`px-6 py-2 rounded-lg text-white transition ${
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
              )}

              {/* Friend Requests */}
              <div className="relative">
                <button
                  onClick={toggleFriendRequests}
                  className="bg-black px-3 py-2 rounded-lg font-bold hover:bg-gray-800"
                >
                  <Tooltip title="Friend Requests" arrow>
                    <Badge badgeContent={pendingRequests.length} color="success">
                      <MailIcon className="text-white" />
                    </Badge>
                  </Tooltip>
                </button>
                {isFriendRequestsOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg text-black z-50">
                    <div className="p-4 font-bold border-b">Friend Requests</div>
                    <ul>
                      {pendingRequests.length > 0 ? (
                        pendingRequests.map((request) => (
                          <li
                            key={request._id}
                            className="p-3 hover:bg-gray-100 flex justify-between items-center"
                          >
                            <span>{name[request.senderId]}</span>
                            <button
                              onClick={() => handleAcceptRequest(request.senderId)}
                              className="bg-green-500 text-white px-2 py-1 rounded-lg hover:bg-green-600 transition"
                            >
                              <CheckIcon />
                            </button>
                          </li>
                        ))
                      ) : (
                        <p className="text-gray-500 p-4">No pending requests</p>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="bg-black px-3 py-2 rounded-lg font-bold hover:bg-red-700 transition"
              >
                <Tooltip title="LogOut" arrow>
                  <LogoutSharpIcon />
                </Tooltip>
              </button>
            </>
          )}

          {/* Mobile Menu Button */}
          <button
            id="menu-button"
            aria-label="Toggle Menu"
            className="lg:hidden bg-gray-700 px-3 py-2 rounded-lg font-bold hover:bg-gray-600 transition"
            onClick={toggleMenu}
          >
            {isMenuOpen ? "✖" : "☰"}
          </button>
        </div>
      </header>
      {isMenuOpen && (
        <nav className="lg:hidden bg-red-800 text-white p-4 space-y-2">
          <Link href="/">
            <p className="block p-3 hover:bg-gray-700 font-bold rounded-lg cursor-pointer">Home</p>
          </Link>
          <Link href="/friends">
            <p className="block p-3 hover:bg-gray-700 font-bold rounded-lg cursor-pointer">
              Friends
            </p>
          </Link>
          <Link href="/profile">
            <p className="block p-3 hover:bg-gray-700 rounded-lg font-bold cursor-pointer">
              Profile
            </p>
          </Link>
          <Link href="/location">
            <p className="block p-3 hover:bg-gray-700 rounded-lg font-bold cursor-pointer">
              Track Location
            </p>
          </Link>
        </nav>
      )}
      <main className="mt-0">{currentChildren}</main>
    </div>
  );
}
