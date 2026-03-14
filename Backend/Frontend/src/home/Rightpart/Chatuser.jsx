import React, { useEffect, useState } from "react";
import useConversation from "../../statemanage/useConversation";
import { useSocketContext } from "../../context/SocketContext";
import { IoArrowBack } from "react-icons/io5";

function Chatuser() {
  const { selectedConversation, setSelectedConversation } = useConversation();
  const { onlineUsers, socket } = useSocketContext();

  const [isTyping, setIsTyping] = useState(false);

  const isOnline = onlineUsers.includes(selectedConversation._id);

  useEffect(() => {
    socket.on("typing", () => {
      setIsTyping(true);
    });

    socket.on("stopTyping", () => {
      setIsTyping(false);
    });

    return () => {
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [socket]);

  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-gray-700">
      <button
        className="md:hidden"
        onClick={() => setSelectedConversation(null)}
      >
        <IoArrowBack className="text-xl text-white" />
      </button>

      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-gray-500 flex items-center justify-center text-white font-bold">
          {getInitials(selectedConversation.fullname)}
        </div>

        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-white"></span>
        )}
      </div>

      <div>
        <h1 className="text-white font-semibold">
          {selectedConversation.fullname}
        </h1>

        {isTyping ? (
          <span className="text-sm text-green-400">typing...</span>
        ) : (
          <span className="text-sm text-gray-300">
            {isOnline
              ? "Online"
              : `Last seen ${new Date(
                  selectedConversation.lastSeen
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`}
          </span>
        )}
      </div>
    </div>
  );
}

export default Chatuser;
