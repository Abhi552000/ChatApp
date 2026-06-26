import React from "react";

function Message({ message }) {
  const authUser = JSON.parse(localStorage.getItem("ChatApp"));
  const itsMe = message.senderId === authUser.user._id;

  const chatName = itsMe ? "chat-end" : "chat-start";
  const chatColor = itsMe 
    ? "bg-themeBgMsgSent text-themeTextMsg shadow-sm" 
    : "bg-themeBgMsgRecv text-themeTextPrimary shadow-sm";

  const createdAt = new Date(message.createdAt);
  const formattedTime = createdAt.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`chat ${chatName} mb-1`}>
      <div className={`chat-bubble ${chatColor} px-3 py-1.5 max-w-[70%] rounded-2xl flex flex-col relative min-w-[85px]`}>
        <span className="text-[14.5px] leading-snug break-words pb-2.5 pr-12 text-current">
          {message.message}
        </span>
        
        <div className="absolute bottom-1 right-2 flex items-center space-x-1 text-[9.5px] opacity-70 select-none">
          <span>{formattedTime}</span>
          {itsMe && (
            <span className={message.seen ? "text-blue-400 font-bold" : "text-gray-400"}>
              {message.seen ? "✓✓" : "✓"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default Message;
