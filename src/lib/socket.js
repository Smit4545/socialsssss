import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export const useSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const serverUrl =
      process.env.NODE_ENV !== "development"
        ? "http://localhost:3000" // Local development URL
        : "https://5b0b-2401-4900-1c80-a3e0-480f-d842-a400-853f.ngrok-free.app"; // ngrok URL

    const socketInstance = io(serverUrl, {
      path: "/api/socket.io",
    });

    setSocket(socketInstance);

    
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return { socket };
};
