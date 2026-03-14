import React, { useEffect } from "react";
import { useSocketContext } from "./SocketContext.jsx";
import useConversation from "../statemanage/useConversation.js";
import sound from "../assets/notification.mp3";

const useGetSocketMessage = () => {
  const { socket } = useSocketContext();
  const { messages, setMessage } = useConversation();

  useEffect(() => {
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      const notification = new Audio(sound);
      notification.play();

      setMessage((prev) => [...prev, newMessage]);
    });

    socket.on("messageSeen", ({ senderId }) => {
      setMessage((prevMessages) =>
        prevMessages.map((msg) =>
          msg.senderId === senderId ? { ...msg, seen: true } : msg
        )
      );
    });

    return () => {
      socket.off("newMessage");
      socket.off("messageSeen");
    };
  }, [socket, setMessage]);
};

export default useGetSocketMessage;
