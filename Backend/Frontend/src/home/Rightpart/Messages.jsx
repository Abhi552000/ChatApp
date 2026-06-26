import React, { useEffect, useRef } from "react";
import Message from "./Message.jsx";
import useGetMessage from "../../context/useGetMessage.js";
import Loading from "../../components/Loading.jsx";
import useGetSocketMessage from "../../context/useGetSocketMessage.js";
import { useSocketContext } from "../../context/SocketContext.jsx";
import useConversation from "../../statemanage/useConversation.js";

function Messages() {
  const { loading, messages } = useGetMessage();
  useGetSocketMessage();

  const { socket } = useSocketContext();
  const { selectedConversation } = useConversation();

  const lastMsgRef = useRef();

  useEffect(() => {
    setTimeout(() => {
      lastMsgRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }, 100);
  }, [messages]);

  // NEW: emit seen event
  useEffect(() => {
    if (!socket || !selectedConversation) return;

    socket.emit("messageSeen", {
      senderId: selectedConversation._id,
    });
  }, [messages]);

  const groupMessagesByDate = (msgList) => {
    const groups = {};
    if (!Array.isArray(msgList)) return groups;
    
    msgList.forEach((msg) => {
      const dateKey = new Date(msg.createdAt).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(msg);
    });
    return groups;
  };

  const formatDateLabel = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  const grouped = groupMessagesByDate(messages);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-themeBgPrimary">
      {loading ? (
        <Loading />
      ) : Array.isArray(messages) && messages.length > 0 ? (
        Object.keys(grouped).map((dateKey) => {
          const dateMessages = grouped[dateKey];
          return (
            <div key={dateKey} className="space-y-2.5">
              {/* Centered Date Label */}
              <div className="flex justify-center my-4">
                <span className="bg-themeBgSecondary border border-themeBorder text-themeTextSecondary text-xs px-3 py-1 rounded-full shadow-sm select-none">
                  {formatDateLabel(dateKey)}
                </span>
              </div>
              
              {/* Group Messages */}
              {dateMessages.map((message) => {
                const isLast = message._id === messages[messages.length - 1]._id;
                return (
                  <div key={message._id} ref={isLast ? lastMsgRef : null}>
                    <Message message={message} />
                  </div>
                );
              })}
            </div>
          );
        })
      ) : (
        <div className="flex justify-center items-center h-full text-themeTextSecondary">
          <p>👋 Say Hi to start conversation</p>
        </div>
      )}
    </div>
  );
}

export default Messages;
