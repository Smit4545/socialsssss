"use client";

import { useState, useEffect } from "react";
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

export default function Layout({ children }) {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isFriendRequestsOpen, setFriendRequestsOpen] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [name, setName] = useState({});
  const [hasToken, setHasToken] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentChildren, setCurrentChildren] = useState(children);
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

  return (
    <div className="min-h-screen  flex flex-col">
      <header className="bg-red-900 text-white px-4 py-3 flex items-center justify-between">
        <Link href="/">
          <Image
            src="/logo.webp"
            alt="Socialsssss Logo"
            width={50}
            height={50}
            className="rounded-full"
          />
        </Link>
        <div className="flex items-center space-x-4">
          <nav className="hidden lg:flex space-x-4">
            <Tooltip title="Friends" arrow>
              <Link href="/friends">
                <PeopleAltIcon style={{ color: "white", height: "40px", width: "50px" }} />
              </Link>
            </Tooltip>
            <Tooltip title="Profile" arrow>
              <Link href="/profile">
                <AccountBoxOutlinedIcon style={{ color: "white", height: "40px", width: "50px" }} />
              </Link>
            </Tooltip>
            <Tooltip title="Location" arrow>
              <Link href="/location">
                <LocationOnIcon style={{ color: "white", height: "40px", width: "50px" }} />
              </Link>
            </Tooltip>
          </nav>

          {hasToken && userId && (
            <>
              <div className="relative">
                <button
                  onClick={toggleFriendRequests}
                  className="bg-black px-3 py-2 rounded-lg font-bold"
                >
                  <Badge badgeContent={pendingRequests.length} color="success">
                    <MailIcon color="action" style={{ color: "white" }} />
                  </Badge>
                  {/* {pendingRequests.length > 0 && (
                    <span className="ml-2 bg-blue-500 text-white text-sm px-2 py-1 rounded-full">
                      {pendingRequests.length}
                    </span>
                  )} */}
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
                            <div className="space-x-2">
                              <button
                                onClick={() => handleAcceptRequest(request.senderId)}
                                className="bg-green-500 text-white px-2 py-1 rounded-lg hover:bg-green-600"
                              >
                                <CheckIcon />
                              </button>
                            </div>
                          </li>
                        ))
                      ) : (
                        <p className="text-gray-500 p-4">No pending requests</p>
                      )}
                    </ul>
                  </div>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="bg-black px-3 py-2 rounded-lg font-bold hover:bg-red-700"
              >
                <LogoutSharpIcon />
              </button>
            </>
          )}

          <button
            id="menu-button"
            aria-label="Toggle Menu"
            className="lg:hidden bg-gray-700 px-3 py-2 rounded-lg font-bold hover:bg-gray-600"
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
