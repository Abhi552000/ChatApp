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

  const handleClick = () => {
    setSelectedConversation(user);
    // Reset unread count for this user locally in the list
    const { setAllUsers } = useConversation.getState();
    setAllUsers((prevUsers) => {
      if (!Array.isArray(prevUsers)) return [];
      return prevUsers.map((u) =>
        String(u._id) === String(user._id) ? { ...u, unreadCount: 0 } : u
      );
    });
  };

  const getLastMessageText = () => {
    if (!user.lastMessage) return user.email; // Fallback to email if no chat history
    
    // Check if it's our own message
    const isMe = String(user.lastMessage.senderId) !== String(user._id);
    const prefix = isMe ? "You: " : "";
    
    const msgText = user.lastMessage.message;
    return `${prefix}${msgText.length > 25 ? msgText.substring(0, 22) + "..." : msgText}`;
  };

  const getLastMessageTime = () => {
    if (!user.lastMessage) return "";
    const date = new Date(user.lastMessage.createdAt);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={`hover:bg-themeBgHover duration-300 ${
        isSelected ? "bg-themeBgHover" : ""
      }`}
      onClick={handleClick}
    >
      <div className="flex justify-between items-center px-8 py-3 cursor-pointer border-b border-themeBorder/10">
        <div className="flex space-x-4 items-center flex-1 min-w-0">
          {/* Avatar with Online indicator */}
          <div className={`relative flex-shrink-0 ${isOnline ? "before:content-[''] before:absolute before:bottom-0 before:right-0 before:w-3 before:h-3 before:bg-green-500 before:rounded-full before:border-2 before:border-themeBgSecondary z-10" : ""}`}>
            <div className="w-12 h-12 rounded-full overflow-hidden bg-themeBgHeader text-themeTextPrimary font-semibold text-lg flex items-center justify-center border border-themeBorder">
              {user.avatar ? (
                <img src={user.avatar} alt={user.fullname} className="w-full h-full object-cover" />
              ) : (
                getInitials(user.fullname)
              )}
            </div>
          </div>
          
          {/* Name and Last Message Preview */}
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-themeTextPrimary truncate">{user.fullname}</h1>
            <span className="text-sm text-themeTextSecondary truncate block mt-0.5">
              {getLastMessageText()}
            </span>
          </div>
        </div>

        {/* Right side info (Time and unread count) */}
        <div className="flex flex-col items-end space-y-1.5 ml-3 flex-shrink-0">
          <span className="text-xs text-themeTextSecondary">
            {getLastMessageTime()}
          </span>
          {user.unreadCount > 0 && (
            <span className="flex items-center justify-center bg-green-500 text-white font-bold text-xs rounded-full min-w-5 h-5 px-1.5 shadow-sm">
              {user.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default User;
