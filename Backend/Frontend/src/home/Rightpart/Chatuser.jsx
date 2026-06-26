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

  const formatLastSeen = (lastSeenDate) => {
    if (!lastSeenDate) return "Offline";
    
    const date = new Date(lastSeenDate);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    
    const timeString = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    
    if (date.toDateString() === today.toDateString()) {
      return `Last seen today at ${timeString}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Last seen yesterday at ${timeString}`;
    } else {
      const diffTime = Math.abs(today - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 7) {
        return `Last seen ${diffDays} days ago`;
      } else {
        return `Last seen on ${date.toLocaleDateString([], {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}`;
      }
    }
  };

  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-themeBgHeader border-b border-themeBorder">
      <button
        className="md:hidden"
        onClick={() => setSelectedConversation(null)}
      >
        <IoArrowBack className="text-xl text-themeTextPrimary" />
      </button>

      <div className="relative">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-themeBgSecondary flex items-center justify-center text-themeTextPrimary font-bold border border-themeBorder">
          {selectedConversation.avatar ? (
            <img src={selectedConversation.avatar} alt={selectedConversation.fullname} className="w-full h-full object-cover" />
          ) : (
            getInitials(selectedConversation.fullname)
          )}
        </div>

        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-themeBgHeader"></span>
        )}
      </div>

      <div>
        <h1 className="text-themeTextPrimary font-semibold">
          {selectedConversation.fullname}
        </h1>

        {isTyping ? (
          <span className="text-xs text-green-500 font-medium">typing...</span>
        ) : (
          <span className="text-xs text-themeTextSecondary">
            {isOnline ? "Online" : formatLastSeen(selectedConversation.lastSeen)}
          </span>
        )}
      </div>
    </div>
  );
}

export default Chatuser;
