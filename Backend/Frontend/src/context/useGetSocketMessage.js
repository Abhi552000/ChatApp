import React, { useEffect } from "react";
import { useSocketContext } from "./SocketContext.jsx";
import useConversation from "../statemanage/useConversation.js";
import sound from "../assets/notification.mp3";

const useGetSocketMessage = () => {
  const { socket } = useSocketContext();
  const { setMessage, setAllUsers } = useConversation();

  useEffect(() => {
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      console.log("[Socket] Received newMessage:", newMessage);
      
      // Safe audio playback in case of autoplay restrictions
      try {
        const notification = new Audio(sound);
        notification.play().catch((err) => {
          console.warn("[Socket] Audio autoplay blocked or failed:", err.message);
        });
      } catch (audioErr) {
        console.warn("[Socket] Failed to create Audio object:", audioErr);
      }

      // Retrieve current selectedConversation from Zustand directly (to avoid stale closures in useEffect)
      const currentSelected = useConversation.getState().selectedConversation;
      console.log("[Socket] Current selected conversation:", currentSelected);

      const isSenderActive = currentSelected && String(currentSelected._id) === String(newMessage.senderId);

      // Only append to screen messages if the sender matches the active chat
      if (isSenderActive) {
        console.log("[Socket] Appending message to active conversation");
        setMessage((prev) => {
          if (!Array.isArray(prev)) return [newMessage];
          return [...prev, newMessage];
        });
        // Emit seen event back via socket since we are viewing the chat
        socket.emit("messageSeen", { senderId: newMessage.senderId });
      } else {
        console.log("[Socket] Message not for active conversation. active:", currentSelected?._id, "sender:", newMessage.senderId);
      }

      // Update that user's unread count and lastMessage in the allUsers list
      setAllUsers((prevUsers) => {
        if (!Array.isArray(prevUsers)) return [];
        return prevUsers.map((u) => {
          if (String(u._id) === String(newMessage.senderId)) {
            return {
              ...u,
              lastMessage: newMessage,
              unreadCount: isSenderActive ? 0 : (u.unreadCount || 0) + 1,
            };
          }
          return u;
        });
      });
    });

    socket.on("messageSeen", ({ senderId }) => {
      console.log("[Socket] Received messageSeen event for senderId:", senderId);
      
      // Mark our sent messages to this user as seen (senderId matches the receiver of our messages)
      setMessage((prevMessages) => {
        if (!Array.isArray(prevMessages)) return [];
        return prevMessages.map((msg) =>
          String(msg.senderId) !== String(senderId) ? { ...msg, seen: true } : msg
        );
      });

      // Also update the lastMessage state inside allUsers if it was sent by us
      setAllUsers((prevUsers) => {
        if (!Array.isArray(prevUsers)) return [];
        return prevUsers.map((u) => {
          if (String(u._id) === String(senderId) && u.lastMessage && String(u.lastMessage.senderId) !== String(senderId)) {
            return {
              ...u,
              lastMessage: { ...u.lastMessage, seen: true },
            };
          }
          return u;
        });
      });
    });

    return () => {
      socket.off("newMessage");
      socket.off("messageSeen");
    };
  }, [socket, setMessage, setAllUsers]);
};

export default useGetSocketMessage;
