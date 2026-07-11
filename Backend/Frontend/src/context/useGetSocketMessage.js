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
      const notification = new Audio(sound);
      notification.play();

      // Retrieve current selectedConversation from Zustand directly (to avoid stale closures in useEffect)
      const currentSelected = useConversation.getState().selectedConversation;

      // Only append to screen messages if the sender matches the active chat
      if (currentSelected && currentSelected._id === newMessage.senderId) {
        setMessage((prev) => [...prev, newMessage]);
        // Emit seen event back via socket since we are viewing the chat
        socket.emit("messageSeen", { senderId: newMessage.senderId });
      }

      // Update that user's unread count and lastMessage in the allUsers list
      setAllUsers((prevUsers) =>
        prevUsers.map((u) => {
          if (u._id === newMessage.senderId) {
            const isSenderActive = currentSelected && currentSelected._id === newMessage.senderId;
            return {
              ...u,
              lastMessage: newMessage,
              unreadCount: isSenderActive ? 0 : (u.unreadCount || 0) + 1,
            };
          }
          return u;
        })
      );
    });

    socket.on("messageSeen", ({ senderId }) => {
      // Mark active messages as seen
      setMessage((prevMessages) =>
        prevMessages.map((msg) =>
          msg.senderId === senderId ? { ...msg, seen: true } : msg
        )
      );

      // Also update the lastMessage state inside allUsers if it was sent by us
      setAllUsers((prevUsers) =>
        prevUsers.map((u) => {
          if (u._id === senderId && u.lastMessage && u.lastMessage.senderId !== senderId) {
            return {
              ...u,
              lastMessage: { ...u.lastMessage, seen: true },
            };
          }
          return u;
        })
      );
    });

    return () => {
      socket.off("newMessage");
      socket.off("messageSeen");
    };
  }, [socket, setMessage, setAllUsers]);
};

export default useGetSocketMessage;
