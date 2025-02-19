const { createServer } = require("http");
import next from "next";
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost" || "0.0.0.0";
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
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // Listen for "join-room" to join a room with a unique name
    socket.on("join-room", ({ userId, friendId }) => {
      const room = [userId, friendId].sort().join("-");
      socket.join(room);
      console.log(`User ${userId} joined room: ${room}`);
    });

    // Listen for "send-message" event to broadcast to the room
    socket.on("send-message", (message) => {
      const room = [message.senderId, message.receiverId].sort().join("-");
      socket.to(room).emit("receive-message", message); // Emit to the room
      console.log(`Message sent to room ${room}:`, message);
    });

    // Disconnect event
    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
