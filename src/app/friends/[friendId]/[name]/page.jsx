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
import {
  Video,
  PhoneOff,
  Phone,
  PhoneCall,
  ArrowLeft,
  Send,
  Mic,
  MicOff,
  VideoOff,
  Paperclip,
  X,
  Download,
  FileIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";

export default function Chat() {
  const router = useRouter();
  const params = useParams();
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const username = typeof window !== "undefined" ? localStorage.getItem("username") : null;
  const friendId = params.friendId;
  const name = params.name;

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
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
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

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
        setMessages(data.messages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchChatHistory();

    const roomId = [userId, friendId].sort().join("-");
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
    if (!newMessage.trim() && !selectedFile) return;

    const messageData = {
      senderId: userId,
      receiverId: friendId,
      message: newMessage,
      createdAt: new Date(),
      senderName: username,
    };

    try {
      const res = await fetch(`/api/chat/${userId}/${friendId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage }),
      });

      const data = await res.json();
      if (data.success) {
        socket.emit("send-message", messageData);
        setMessages((prevMessages) => [...prevMessages, messageData]);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size exceeds 10MB limit");
        return;
      }
      setSelectedFile(file);
      toast.info(`File selected: ${file.name}`);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

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
        friendVideoRef.current.srcObject = remoteStream;
        friendVideoRef.current.play();
      });

      peer.on("connect", () => {
        setIsCallConnected(true);
      });
    });
  };

  const acceptCall = () => {
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

      peer.on("stream", (remoteStream) => {
        friendVideoRef.current.srcObject = remoteStream;
        friendVideoRef.current.play();
      });

      peer.on("connect", () => {
        setIsCallConnected(true);
      });
    });
  };

  const rejectCall = () => {
    setIncomingCall(null);
    socket.emit("end-call", { userToEnd: incomingCall.from });
  };

  const endCall = () => {
    myVideoRef.current?.srcObject?.getTracks().forEach((track) => track.stop());

    if (friendVideoRef.current) {
      friendVideoRef.current.srcObject = null;
    }

    if (myVideoRef.current) {
      myVideoRef.current.srcObject = null;
    }

    socket.emit("end-call", { userToEnd: friendId });

    setIsCalling(false);
    setShowVideo(false);
    setIncomingCall(null);
    setCallAccepted(false);
    setIsCallConnected(false);
    setIsMuted(false);
    setIsVideoOff(false);
  };

  const toggleMute = () => {
    if (myVideoRef.current?.srcObject) {
      myVideoRef.current.srcObject.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (myVideoRef.current?.srcObject) {
      myVideoRef.current.srcObject.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return new Date(date).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else if (diffInHours < 168) {
      return new Date(date).toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/friends")}
            className="p-2 hover:bg-slate-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Button>
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12 ring-2 ring-slate-200">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-lg">
                {name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-semibold text-slate-800">{name}</h1>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-500">Online</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          {!isCallConnected ? (
            <Button
              onClick={startCall}
              disabled={isCalling}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
            >
              {isCalling ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Calling...</span>
                </div>
              ) : (
                <Video className="w-5 h-5" />
              )}
            </Button>
          ) : (
            <Button
              onClick={endCall}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
            >
              <PhoneOff className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.senderId === userId ? "justify-end" : "justify-start"} animate-fade-in`}
          >
            <div
              className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${msg.senderId === userId ? "flex-row-reverse space-x-reverse" : ""}`}
            >
              {msg.senderId !== userId && (
                <Avatar className="w-8 h-8 mb-1">
                  <AvatarFallback className="bg-slate-200 text-slate-600 text-sm">
                    {name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`px-4 py-3 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md ${
                  msg.senderId === userId
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md"
                    : "bg-white text-slate-800 rounded-bl-md border border-slate-200"
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.message}</p>
                <span
                  className={`text-xs mt-1 block ${
                    msg.senderId === userId ? "text-blue-100" : "text-slate-400"
                  }`}
                >
                  {formatTime(msg.createdAt)}
                </span>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="bg-white/80 backdrop-blur-md border-t border-slate-200 p-4">
        {selectedFile && (
          <div className="flex items-center justify-between mb-2 p-2 bg-slate-100 rounded-lg">
            <div className="flex items-center space-x-2">
              <FileIcon className="w-4 h-4 text-slate-600" />
              <div className="text-xs text-slate-600">
                <p className="font-medium">{selectedFile.name}</p>
                <p>{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeSelectedFile}
              className="p-1 h-auto text-slate-500 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={triggerFileInput}
            className="rounded-full bg-slate-100 hover:bg-slate-200"
          >
            <Paperclip className="w-5 h-5 text-slate-600" />
          </Button>
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-slate-50 border-slate-200 rounded-full px-6 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() && !selectedFile}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>

      {/* Incoming Call Notification */}
      {incomingCall && !callAccepted && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <Card className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm mx-4 text-center animate-scale-in">
            <div className="mb-6">
              <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-blue-200">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                  {name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">{name}</h3>
              <p className="text-slate-500">Incoming video call...</p>
            </div>
            <div className="flex justify-center space-x-4">
              <Button
                onClick={acceptCall}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
              >
                <Phone className="w-6 h-6" />
              </Button>
              <Button
                onClick={rejectCall}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
              >
                <PhoneOff className="w-6 h-6" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Video Call Section */}
      {/* Video Call Section */}
      {/* Video Call Section */}
      {showVideo && (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 to-slate-800 z-40 animate-fade-in">
          <div className="h-full flex flex-col">
            {/* Video Container */}
            <div className="flex-1 relative p-4">
              {/* Friend's Video (Main) */}
              <div className="w-full h-full bg-slate-700 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
                {isCallConnected ? (
                  <video
                    ref={friendVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                    onError={(e) => console.error("Friend video error:", e)}
                  />
                ) : (
                  <div className="text-center">
                    <Avatar className="w-32 h-32 mx-auto mb-6 ring-4 ring-white/20">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-4xl font-bold">
                        {name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-2xl font-semibold text-white mb-2">{name}</h3>
                    {isCalling ? (
                      <div className="flex flex-col items-center">
                        <p className="text-slate-300 mb-2">Connecting...</p>
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <p className="text-slate-300">Waiting for connection...</p>
                    )}
                  </div>
                )}
              </div>

              {/* Your Video (Picture-in-Picture) */}
              <div className="absolute bottom-4 right-4 w-48 h-36 bg-slate-600 rounded-xl overflow-hidden shadow-xl border-2 border-white/20">
                {!isVideoOff ? (
                  <video
                    ref={myVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    onError={(e) => console.error("My video error:", e)}
                  />
                ) : (
                  <div className="w-full h-full bg-slate-600 flex items-center justify-center">
                    <Avatar className="w-16 h-16">
                      <AvatarFallback className="bg-gradient-to-br from-slate-500 to-slate-600 text-white text-xl font-bold">
                        {username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}
              </div>

              {/* Debug Info - Only show in development */}
              {process.env.NODE_ENV === "development" && (
                <div className="absolute top-4 left-4 bg-black/50 text-white p-2 rounded-md text-xs">
                  <div>Status: {isCallConnected ? "Connected" : "Connecting"}</div>
                  <div>Streams: {myVideoRef.current?.srcObject ? "Local OK" : "No local"}</div>
                  <div>Remote: {friendVideoRef.current?.srcObject ? "Remote OK" : "No remote"}</div>
                </div>
              )}
            </div>

            {/* Call Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-900/90 to-transparent">
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={toggleMute}
                  className={`p-4 rounded-full transition-all duration-300 hover:scale-110 ${
                    isMuted
                      ? "bg-red-500/90 text-white"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </Button>

                <Button
                  onClick={toggleVideo}
                  className={`p-4 rounded-full transition-all duration-300 hover:scale-110 ${
                    isVideoOff
                      ? "bg-red-500/90 text-white"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                </Button>

                <Button
                  onClick={endCall}
                  className="bg-red-500/90 hover:bg-red-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
                >
                  <PhoneOff className="w-6 h-6" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
