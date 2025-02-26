// const { createServer } = require("http");
// const next = require("next");
// const { Server } = require("socket.io");

// const dev = process.env.NODE_ENV !== "production";
// const hostname = "localhost";
// const port = 3000;

// const app = next({ dev, hostname, port });
// const handler = app.getRequestHandler();

// app.prepare().then(() => {
//   const httpServer = createServer((req, res) => {
//     handler(req, res);
//   });

//   const io = new Server(httpServer, {
//     path: "/api/socket.io",
//     cors: {
//       origin: [
//         "http://localhost:3000",
//         "https://5de4-2401-4900-1f3f-3198-a5b5-820b-bc7d-4ca6.ngrok-free.app",
//       ],
//       methods: ["GET", "POST"],
//     },
//   });

//   const userLocations = {};

//   io.on("connection", (socket) => {
//     console.log("Socket connected:", socket.id);

//     socket.on("join-room", ({ userId, friendId }) => {
//       if (!userId || !friendId) {
//         console.error("Invalid data for join-room:", { userId, friendId });
//         return;
//       }
//       const room = [userId, friendId].sort().join("-");
//       socket.join(room);
//       console.log(`User ${userId} joined room: ${room}`);
//     });

//     socket.on("send-message", (message) => {
//       if (
//         !message.senderId ||
//         !message.receiverId ||
//         typeof message.message !== "string"
//       ) {
//         console.error("Invalid message data:", message);
//         return;
//       }
//       const room = [message.senderId, message.receiverId].sort().join("-");
//       socket.to(room).emit("receive-message", message);
//       console.log(`Message sent to room ${room}:`, message);
//     });

//     socket.on("update-location", (data) => {
//       if (!data.userId || !data.lat || !data.lng) {
//         console.error("Invalid location data:", data);
//         return;
//       }

//       userLocations[data.userId] = {
//         userId: data.userId,
//         username: data.username || "Unknown",
//         lat: data.lat,
//         lng: data.lng,
//       };

//       io.emit("location-updated", userLocations);
//       console.log(`Location updated: ${data.userId}`, data);
//     });

//     socket.on("disconnect", () => {
//       console.log("Socket disconnected:", socket.id);
//       for (const userId in userLocations) {
//         if (userLocations[userId].socketId === socket.id) {
//           delete userLocations[userId];
//           break;
//         }
//       }
//       io.emit("location-updated", userLocations);
//     });
//   });

//   // Graceful Shutdown
//   process.on("SIGTERM", () => {
//     console.log("SIGTERM received. Shutting down gracefully...");
//     httpServer.close(() => {
//       console.log("HTTP server closed.");
//       io.close(() => {
//         console.log("Socket.IO server closed.");
//         process.exit(0);
//       });
//     });
//   });

//   // Start Server
//   httpServer.listen(port, () => {
//     console.log(`> Ready on http://${hostname}:${port}`);
//   });
// });
const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handler(req, res);
  });

  const io = new Server(httpServer, {
    path: "/api/socket.io",
    cors: {
      origin: [
        "http://localhost:3000",
        "https://socialsssss.vercel.app",
        "https://socialsssss.onrender.com",
      ],
      methods: ["GET", "POST"],
    },
  });

  const userLocations = {}; // Store user locations
  const users = {}; // Store connected users (userId -> socketId)
  const activeCalls = {}; // Track active calls (caller -> receiver)

  io.on("connection", (socket) => {
    console.log("✅ New Socket Connected:", socket.id);

    // Register user when they connect
    socket.on("register-user", (userId) => {
      if (!userId) return console.error("❌ Invalid userId on register");

      users[userId] = socket.id; // Store user socket mapping
      io.emit("active-users", Object.keys(users)); // Send active users list
      console.log(`🟢 User Registered: ${userId} (Socket: ${socket.id})`);
    });

    // Join chat room
    socket.on("join-room", ({ userId, friendId }) => {
      if (!userId || !friendId)
        return console.error("❌ Invalid join-room data:", { userId, friendId });

      const room = [userId, friendId].sort().join("-");
      socket.join(room);
      console.log(`👥 User ${userId} joined room: ${room}`);
    });

    // Send & Receive Messages
    socket.on("send-message", (message) => {
      if (!message.senderId || !message.receiverId || typeof message.message !== "string") {
        return console.error("❌ Invalid message data:", message);
      }

      const room = [message.senderId, message.receiverId].sort().join("-");
      socket.to(room).emit("receive-message", message);
      // io.to(receiverId).emit("new-notification", { senderId:message.senderId, message });
      console.log(`📩 Message sent to ${room}:`, message);
    });

    // Location Tracking
    socket.on("update-location", (data) => {
      if (!data.userId || !data.lat || !data.lng) {
        console.error("Invalid location data:", data);
        return;
      }

      userLocations[data.userId] = {
        userId: data.userId,
        username: data.username,
        lat: data.lat,
        lng: data.lng,
        //  speed: data.speed,
      };

      io.emit("location-updated", userLocations);
      console.log(`Location updated: ${data.userId}`, data);
    });

    // Video Call: Initiate Call
    socket.on("call-user", ({ userToCall, signal, from }) => {
      if (!users[userToCall]) {
        console.error("❌ User Not Found:", userToCall);
        io.to(users[from]).emit("call-error", { message: "User is offline or not registered" });
        return;
      }

      activeCalls[from] = userToCall; // Store active call
      io.to(users[userToCall]).emit("incoming-call", { signal, from });
      console.log(`📞 Call request sent from ${from} to ${userToCall}`);
    });

    // Video Call: Accept Call
    socket.on("accept-call", ({ signal, from }) => {
      if (!users[from]) return console.error("❌ Caller Not Found:", from);

      io.to(users[from]).emit("call-accepted", { signal, answerId: socket.id });
      console.log(`✅ Call accepted by ${socket.id} for ${from}`);
    });

    // Video Call: End Call
    socket.on("end-call", ({ userToEnd }) => {
      if (!users[userToEnd]) return console.error("❌ User Not Found:", userToEnd);

      io.to(users[userToEnd]).emit("call-ended");
      delete activeCalls[userToEnd];
      console.log(`🔴 Call ended by ${socket.id} for ${userToEnd}`);
    });

    // ICE Candidate Exchange (WebRTC)
    socket.on("send-ice-candidate", ({ userToCall, candidate }) => {
      if (!users[userToCall]) return console.error("❌ User Not Found:", userToCall);

      io.to(users[userToCall]).emit("receive-ice-candidate", candidate);
      console.log(`❄️ ICE Candidate sent to ${userToCall}`);
    });

    // Handle Disconnection
    socket.on("disconnect", () => {
      console.log("🔴 Socket Disconnected:", socket.id);

      // Remove user from active list
      const disconnectedUser = Object.keys(users).find((userId) => users[userId] === socket.id);
      if (disconnectedUser) {
        delete users[disconnectedUser];
        io.emit("active-users", Object.keys(users)); // Notify active users list update
      }

      io.emit("location-updated", userLocations);
    });
  });

  // Graceful Shutdown
  process.on("SIGTERM", () => {
    console.log("⚠️ SIGTERM received. Shutting down...");
    httpServer.close(() => {
      console.log("🚫 Server Closed.");
      io.close(() => {
        console.log("🛑 Socket.IO Closed.");
        process.exit(0);
      });
    });
  });

  // Start Server
  httpServer.listen(port, () => {
    console.log(`🚀 Server Ready on http://${hostname}:${port}`);
  });
});
