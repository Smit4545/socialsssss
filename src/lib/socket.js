import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export const useSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const serverUrl =
      // process.env.NODE_ENV !== "development"
      //   ? "http://localhost:3000" // Local development URL
      "https://socialsssss.onrender.com"; // ngrok URL

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
