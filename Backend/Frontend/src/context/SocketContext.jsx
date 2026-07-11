import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import io from "socket.io-client";
const socketContext = createContext();

// it is a hook.
export const useSocketContext = () => {
  return useContext(socketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [authUser] = useAuth();

  useEffect(() => {
    if (authUser) {
      const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      const socketUrl = isLocalhost ? "http://localhost:5002" : window.location.origin;

      const socket = io(socketUrl, {
        query: {
          userId: authUser.user._id,
        },
      });
      setSocket(socket);

      socket.on("connect", () => {
        console.log("[SocketContext] Socket connected successfully. ID:", socket.id);
      });

      socket.on("connect_error", (error) => {
        console.error("[SocketContext] Socket connection error:", error);
      });

      socket.on("disconnect", (reason) => {
        console.warn("[SocketContext] Socket disconnected. Reason:", reason);
      });

      socket.on("getOnlineUsers", (users) => {
        console.log("[SocketContext] Online users updated:", users);
        setOnlineUsers(users);
      });
      return () => {
        console.log("[SocketContext] Cleaning up socket connection...");
        socket.close();
      };
    } else {
      if (socket) {
        console.log("[SocketContext] Closing socket due to auth logout...");
        socket.close();
        setSocket(null);
      }
    }
  }, [authUser]);
  return (
    <socketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </socketContext.Provider>
  );
};
