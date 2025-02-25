// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useSocket } from "../../../../lib/socket";
// import { useRouter, useParams } from "next/navigation";
// import moment from "moment";

// export default function Chat() {
//   const router = useRouter();
//   const params = useParams();
//   const userId =
//     typeof window !== "undefined" ? localStorage.getItem("userId") : null;
//   const username =
//     typeof window !== "undefined" ? localStorage.getItem("username") : null;
//   const friendId = params.friendId;
//   const name = params.name;

//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");
//   const { socket, isConnected } = useSocket();

//   const messagesEndRef = useRef(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   useEffect(() => {
//     if (!userId || !friendId || !socket) return;

//     const roomId = [userId, friendId].sort().join("-");
//     console.log(`Joining room: ${roomId}`);

//     socket.emit("join-room", { userId, friendId });

//     socket.on("receive-message", (message) => {
//       console.log("Message received:", message);
//       setMessages((prevMessages) => [...prevMessages, message]);
//     });

//     return () => {
//       socket.off("receive-message");
//     };
//   }, [userId, friendId, socket]);

//   const handleSendMessage = (e) => {
//     e.preventDefault();
//     if (!newMessage.trim()) return;

//     const messageData = {
//       senderId: userId,
//       receiverId: friendId,
//       message: newMessage,
//       createdAt: new Date(),
//     };

//     console.log("Sending message:", messageData);
//     socket.emit("send-message", messageData);

//     setMessages((prevMessages) => [...prevMessages, messageData]);
//     setNewMessage("");
//   };

//   return (
//     <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700">
//       {/* Header */}
//       <div className="bg-gray-900 text-white py-4 px-6 flex justify-between items-center shadow-md">
//         <div className="flex items-center space-x-3">
//           <div className="w-12 h-12 text-3xl italic bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center font-bold shadow-md">
//             {name[0].toUpperCase()}
//           </div>
//           <h1 className="text-3xl uppercase font-bold">{name}</h1>
//         </div>
//         <button
//           onClick={() => router.push("/friends")}
//           className="text-xl bg-gray-700 font-semibold text-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-600 transition-all duration-300"
//         >
//           ⬅
//         </button>
//       </div>

//       {/* Chat Messages */}
//       <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-800">
//         {messages.map((msg, index) => (
//           <div
//             key={index}
//             className={`flex ${
//               msg.senderId === userId ? "justify-end" : "justify-start"
//             }`}
//           >
//             <div
//               className={`p-4 rounded-2xl max-w-xs shadow-lg text-sm transition-all duration-300 ${
//                 msg.senderId === userId
//                   ? "bg-wheat text-white font-extrabold text-lg rounded-br-none"
//                   : "bg-gray-500 text-white font-extrabold text-lg rounded-bl-none"
//               }`}
//             >
//               <p className="text-xs uppercase font-bold text-black mb-1">
//                 {msg.senderId !== userId ? name : username}
//               </p>
//               <p>{msg.message}</p>
//               <span className="text-xs text-black mt-2 block">
//                 {moment(msg.createdAt).format("h:mm A")}
//               </span>
//             </div>
//           </div>
//         ))}
//         <div ref={messagesEndRef} />
//       </div>

//       {/* Chat Input */}
//       <form
//         onSubmit={handleSendMessage}
//         className="p-4 bg-gray-900 border-t border-gray-800 flex items-center space-x-4"
//       >
//         <input
//           type="text"
//           value={newMessage}
//           onChange={(e) => setNewMessage(e.target.value)}
//           placeholder="Type a message..."
//           className="flex-grow px-4 py-3 border-none rounded-full shadow-sm bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />
//         <button
//           type="submit"
//           className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-5 py-3 rounded-full font-medium hover:scale-105 shadow-md transition-all duration-300"
//         >
//         ➤
//         </button>
//       </form>
//     </div>
//   );
// }

"use client";

import { useState, useEffect, useRef } from "react";
import { useSocket } from "../../../../lib/socket";
import { useRouter, useParams } from "next/navigation";
import moment from "moment";
import SimplePeer from "simple-peer";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import CallEndIcon from "@mui/icons-material/CallEnd";
import RingVolumeIcon from "@mui/icons-material/RingVolume";
import PhoneDisabledIcon from "@mui/icons-material/PhoneDisabled";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function Chat() {
  const router = useRouter();
  const params = useParams();
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const username = typeof window !== "undefined" ? localStorage.getItem("username") : null;
  const friendId = params.friendId;
  const name = params.name;

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const { socket, isConnected } = useSocket();

  const messagesEndRef = useRef(null);
  const myVideoRef = useRef(null);
  const friendVideoRef = useRef(null);
  const peerRef = useRef(null);

  const [incomingCall, setIncomingCall] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isCallConnected, setIsCallConnected] = useState(false);

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!userId || !friendId || !socket) return;

    const fetchChatHistory = async () => {
      try {
        const res = await fetch(`/api/chat/${userId}/${friendId}`);
        const data = await res.json();
        console.log(data);
        setMessages(data.messages);
        console.log("Fetched chat history:", data.messages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchChatHistory();

    const roomId = [userId, friendId].sort().join("-");
    console.log(`Joining room: ${roomId}`);

    socket.emit("join-room", { userId, friendId });

    socket.on("receive-message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on("incoming-call", ({ signal, from }) => {
      setIncomingCall({ signal, from });
    });

    socket.on("call-accepted", ({ signal }) => {
      if (peerRef.current) {
        peerRef.current.signal(signal);
        setIsCallConnected(true);
      }
    });

    socket.on("call-ended", () => {
      endCall();
    });

    // if (newMessage.senderId !== userId && friendId !== newMessage.senderId) {
    //   new Notification(`New message from ${newMessage.senderName}`, { body: newMessage.message });
    // }

    return () => {
      socket.off("receive-message");
      socket.off("incoming-call");
      socket.off("call-accepted");
      socket.off("call-ended");
    };
  }, [userId, friendId, socket]);

  useEffect(() => {
    if (socket && userId) {
      socket.emit("register-user", userId);
    }
  }, [socket, userId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      senderId: userId,
      receiverId: friendId,
      message: newMessage,
      createdAt: new Date(),
    };

    try {
      // Save message to the database
      const res = await fetch(`/api/chat/${userId}/${friendId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage }),
      });

      const data = await res.json();
      if (data.success) {
        socket.emit("send-message", messageData); // Emit to Socket.IO
        setMessages((prevMessages) => [...prevMessages, messageData]);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // 📞 Initiate a video call
  const startCall = () => {
    setIsCalling(true);
    setShowVideo(true);

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      myVideoRef.current.srcObject = stream;
      myVideoRef.current.play();

      const peer = new SimplePeer({ initiator: true, trickle: false, stream });
      peerRef.current = peer;

      peer.on("signal", (signal) => {
        socket.emit("call-user", { userToCall: friendId, signal, from: userId });
      });

      peer.on("stream", (remoteStream) => {
        console.log(remoteStream); // Log to verify if remoteStream is available
        console.log(friendVideoRef.current);
        friendVideoRef.current.srcObject = remoteStream;
        friendVideoRef.current.play();
      });

      peer.on("connect", () => {
        setIsCallConnected(true);
      });
    });
  };

  // ✅ Accept an incoming call
  const acceptCall = async () => {
    setCallAccepted(true);
    setShowVideo(true);

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      myVideoRef.current.srcObject = stream;
      myVideoRef.current.play();

      const peer = new SimplePeer({ initiator: false, trickle: false, stream });
      peerRef.current = peer;

      peer.signal(incomingCall.signal);

      peer.on("signal", (signal) => {
        socket.emit("accept-call", { signal, from: incomingCall.from });
      });

      peer.on("stream", async (remoteStream) => {
        console.log(remoteStream);
        console.log(friendVideoRef.current);
        friendVideoRef.current.srcObject = remoteStream;
        friendVideoRef.current.play();
      });

      peer.on("connect", () => {
        setIsCallConnected(true);
      });
    });
  };

  // ❌ Reject a call
  const rejectCall = () => {
    setIncomingCall(null);
    socket.emit("end-call", { userToEnd: incomingCall.from });
  };

  // 🔴 End a call
  const endCall = () => {
    // Stop the local media stream (video/audio)
    myVideoRef.current?.srcObject?.getTracks().forEach((track) => track.stop());

    // Clear the video elements
    if (friendVideoRef.current) {
      friendVideoRef.current.srcObject = null; // Clear friend's video
    }

    if (myVideoRef.current) {
      myVideoRef.current.srcObject = null; // Clear your own video if needed
    }

    // Emit "end-call" event
    socket.emit("end-call", { userToEnd: friendId });

    // Reset all states
    setIsCalling(false);
    setShowVideo(false);
    setIncomingCall(null);
    setCallAccepted(false);
    setIsCallConnected(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700">
      {/* Header */}
      <div className="bg-gray-900 text-white py-4 px-6 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 text-3xl italic bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center font-bold shadow-md">
            {name[0].toUpperCase()}
          </div>
          <h1 className="text-3xl uppercase font-bold">{name}</h1>
        </div>
        <div className="flex space-x-3">
          {/* 📞 Call Button */}
          {!isCallConnected ? (
            <button
              onClick={startCall}
              className="bg-green-500 px-4 py-2 rounded-lg text-white font-bold shadow-md hover:bg-green-600 transition-all duration-300"
            >
              <VideoCallIcon />
            </button>
          ) : (
            <button
              onClick={endCall}
              className="bg-red-500 px-4 py-2 rounded-lg text-white font-bold shadow-md hover:bg-red-600 transition-all duration-300"
            >
              <CallEndIcon />
            </button>
          )}

          <button
            onClick={() => router.push("/friends")}
            className="text-xl bg-gray-700 font-semibold text-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-600 transition-all duration-300"
          >
            <ArrowBackIcon />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-800">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.senderId === userId ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`p-4 rounded-2xl max-w-xs shadow-lg text-sm transition-all duration-300 ${
                msg.senderId === userId
                  ? "bg-wheat text-white font-extrabold text-lg rounded-br-none"
                  : "bg-gray-500 text-white font-extrabold text-lg rounded-bl-none"
              }`}
            >
              <p className="text-xs uppercase font-bold text-black mb-1">
                {msg.senderId !== userId ? name : username}
              </p>
              <p>{msg.message}</p>
              <span className="text-xs text-black mt-2 block">
                {moment(msg.createdAt).format("h:mm A")}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 bg-gray-900 border-t border-gray-800 flex items-center space-x-4"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow px-4 py-3 border-none rounded-full shadow-sm bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-5 py-3 rounded-full font-medium hover:scale-105 shadow-md transition-all duration-300"
        >
          ➤
        </button>
      </form>

      {/* Incoming Call Notification */}
      {incomingCall && !callAccepted && (
        <div className="fixed top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 p-4 rounded-lg shadow-lg">
          <p className="text-white font-bold">{name} is calling...</p>
          <button
            onClick={acceptCall}
            className="bg-green-500 px-4 py-2 rounded-lg text-white font-bold shadow-md mr-2"
          >
            <RingVolumeIcon />
          </button>
          <button
            onClick={rejectCall}
            className="bg-red-500 px-4 py-2 rounded-lg text-white font-bold shadow-md"
          >
            <PhoneDisabledIcon />
          </button>
        </div>
      )}

      {/* Video Call Section */}
      {showVideo && (
        <div className="flex justify-center items-center space-x-4">
          <video
            ref={myVideoRef}
            autoPlay
            muted
            className="w-56 h-44 border-2 border-white rounded-lg"
          />
          <video
            ref={friendVideoRef}
            autoPlay
            className="w-56 h-44 border-2 border-white rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
