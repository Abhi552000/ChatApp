import React from "react";
import useConversation from "../../statemanage/useConversation.js";
import { useSocketContext } from "../../context/SocketContext.jsx";

function User({ user }) {
  const { selectedConversation, setSelectedConversation } = useConversation();
  const isSelected = selectedConversation?._id === user._id;
  const { onlineUsers } = useSocketContext();
  const isOnline = onlineUsers.includes(user._id);

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
    <div
      className={`hover:bg-slate-600 duration-300 ${
        isSelected ? "bg-slate-700" : ""
      }`}
      onClick={() => setSelectedConversation(user)}
    >
      <div className="flex space-x-4 px-8 py-3 cursor-pointer">
        <div className={`relative ${isOnline ? "before:content-[''] before:absolute before:bottom-0 before:right-0 before:w-3 before:h-3 before:bg-green-500 before:rounded-full before:border-2 before:border-white" : ""}`}>
          <div className="w-14 h-14 rounded-full bg-gray-500 text-white font-semibold text-xl flex items-center justify-center">
            {getInitials(user.fullname)}
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="font-bold text-white">{user.fullname}</h1>
          <span className="text-sm text-gray-300">{user.email}</span>
        </div>
      </div>
    </div>
  );
}

export default User;
