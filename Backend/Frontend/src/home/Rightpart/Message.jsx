import React from "react";

function Message({ message }) {
  const authUser = JSON.parse(localStorage.getItem("ChatApp"));
  const itsMe = message.senderId === authUser.user._id;

  const chatName = itsMe ? "chat-end" : "chat-start";
  const chatColor = itsMe ? "bg-blue-500" : "bg-green-500";

  const createdAt = new Date(message.createdAt);
  const formattedTime = createdAt.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`chat ${chatName}`}>
      <div className={`chat-bubble text-white ${chatColor}`}>
        {message.message}
      </div>

      <div className="chat-footer flex items-center gap-1 text-xs text-gray-400">
        {formattedTime}

        {/* show status only for sender */}
        {itsMe && (
          <span
            className={`ml-1 ${
              message.seen ? "text-blue-400" : "text-gray-400"
            }`}
          >
            {message.seen ? "✓✓" : "✓"}
          </span>
        )}
      </div>
    </div>
  );
}

export default Message;
