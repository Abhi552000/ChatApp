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

    socket.emit("messageSeen", selectedConversation._id);
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-2">
      {loading ? (
        <Loading />
      ) : messages.length > 0 ? (
        messages.map((message) => (
          <div key={message._id} ref={lastMsgRef}>
            <Message message={message} />
          </div>
        ))
      ) : (
        <div className="flex justify-center items-center h-full text-gray-400">
          <p>👋 Say Hi to start conversation</p>
        </div>
      )}
    </div>
  );
}

export default Messages;
