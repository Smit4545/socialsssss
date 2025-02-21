"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast"; // Import toast library

export default function AddFriends() {
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("/api/users", {
          headers: { "user-id": userId },
        });
        setUsers(res.data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    const fetchFriends = async () => {
      try {
        const res = await axios.get(`/api/friends/${userId}`);
        setFriends(res.data.friends);
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };

    const fetchPendingRequests = async () => {
      try {
        const res = await axios.get(`/api/friendrequests/${userId}`);
        setPendingRequests(res.data.pendingRequests);
      } catch (error) {
        console.error("Error fetching pending friend requests:", error);
      }
    };

    Promise.all([fetchUsers(), fetchFriends(), fetchPendingRequests()]).then(() =>
      setLoading(false)
    );
  }, [userId]);

  const handleSendFriendRequest = async (friendId) => {
    // Instantly update the UI to show "Pending..."
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user._id === friendId ? { ...user, requestStatus: "pending" } : user
      )
    );

    // Show success toast notification
    toast.success("Friend request sent!");

    try {
      await axios.post("/api/friendrequests/send", {
        senderId: userId,
        receiverId: friendId,
      });

      // Add the friend request to the pendingRequests state
      setPendingRequests((prevRequests) => [
        { ...(prevRequests?.length > 0 ? prevRequests : []) },
        { senderId: userId, receiverId: friendId },
      ]);
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast.error("Error sending friend request"); // Show error toast
    }
  };

  const isRequestPending = (friendId) =>
    pendingRequests?.some(
      (request) =>
        (request.senderId === friendId && request.receiverId === userId) ||
        (request.senderId === userId && request.receiverId === friendId)
    );

  const isFriend = (friendId) => friends.some((friend) => friend === friendId);

  return (
    <div className="min-h-screen bg-reddd flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">👥 Add Friends</h1>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
        </div>
      ) : users.length === 0 ? (
        // No Friends to Add Message
        <p className="text-gray-600 text-lg mt-6">🎉 You've added all available friends!</p>
      ) : (
        <div className="w-full max-w-3xl space-y-4">
          {users
            .filter((user) => user._id !== userId)
            .map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between bg-white shadow-md p-4 rounded-xl hover:shadow-lg transition"
              >
                <div>
                  <h3 className="text-xl font-semibold text-gray-700">{user.username}</h3>
                  <p className="text-gray-500">{user.email}</p>
                </div>

                {isFriend(user._id) ? (
                  <button
                    className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold cursor-not-allowed"
                    disabled
                  >
                    ✅ Friends
                  </button>
                ) : isRequestPending(user._id) || user.requestStatus === "pending" ? (
                  <button
                    disabled
                    className="px-4 py-2 rounded-lg bg-gray-400 text-white font-semibold cursor-not-allowed"
                  >
                    ⏳ Pending...
                  </button>
                ) : (
                  <button
                    onClick={() => handleSendFriendRequest(user._id)}
                    className="px-4 py-2 rounded-lg bg-redd text-white font-semibold hover:bg-blue-600 transition"
                  >
                    ➕ Add Friend
                  </button>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
