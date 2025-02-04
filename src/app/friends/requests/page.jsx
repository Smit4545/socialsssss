'use client'

import { useState, useEffect } from "react";
import axios from "axios";

export default function FriendRequests() {
  const userId = localStorage.getItem("userId"); // Get the logged-in user ID dynamically
  const [pendingRequests, setPendingRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [name, setName] = useState();

  useEffect(() => {
    // Fetch all pending friend requests
    const fetchPendingRequests = async () => {
      try {
        const res = await axios.get(`/api/showreq/${userId}`);
        setPendingRequests(res.data.pendingRequests);
         // Set pending requests
        const senderNames = {};
        res.data.users?.forEach(user => {
          senderNames[user._id] = user.username;
        });
        console.log(senderNames)
        setName(senderNames);
      } catch (error) {
        console.error("Error fetching pending friend requests:", error);
      }
    };
    console.log(name)
    fetchPendingRequests();
  }, [userId,setPendingRequests]);

  const handleAcceptRequest = async (senderId) => {
    try {
      const res = await axios.post("/api/friendrequests/accept", {
       userId:senderId,
        requestId: userId,
      });

      setMessage(res.data.message);

      // Remove accepted request from pending requests list
      setPendingRequests((prevRequests) =>
        prevRequests.filter((request) => request.senderId !== senderId)
      );
    } catch (error) {
      console.error("Error accepting friend request:", error);
      setMessage("Error accepting friend request");
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Pending Friend Requests</h1>
      <div className="space-y-4 mb-6">
        {message && <p className="text-green-600">{message}</p>}

        {!pendingRequests? (
          <p className="text-gray-500">You have no pending requests.</p>
        ) : (
          pendingRequests?.map((request) => (
            <div
              key={request._id}
              className="bg-white shadow-lg rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <h3 className="text-xl font-semibold">{name[request.senderId]}</h3>
                <p className="text-gray-500">Sent a friend request</p>
              </div>
              <button
                onClick={() => handleAcceptRequest(request.senderId)}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
              >
                Accept
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
}
