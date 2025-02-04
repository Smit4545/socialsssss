import { useEffect, useState } from "react";
import { io } from "socket.io-client";

// Create a variable to hold the socket instance
let socket;

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Ensure socket is initialized only on the client-side
    if (typeof window !== "undefined" && !socket) {
      socket = io("http://localhost:3000/api/socket", {
        transports: ["websocket"], // Ensure WebSocket is used
        withCredentials: true,      // Enable credentials (cookies, etc.)
      });

      socket.on("connect", () => {
        console.log("Connected to Socket.IO server");
        setIsConnected(true);
      });

      socket.on("disconnect", () => {
        console.log("Disconnected from Socket.IO server");
        setIsConnected(false);
      });

      socket.on("connect_error", (err) => {
        console.error("Connection failed: ", err.message);
      });

      socket.on("reconnect", () => {
        console.log("Reconnected to Socket.IO server");
      });

      socket.on("reconnect_error", (err) => {
        console.error("Reconnection failed: ", err.message);
      });

      // Cleanup on unmount
      return () => {
        socket.disconnect();
      };
    }
  }, []);

  return { socket, isConnected };
};
