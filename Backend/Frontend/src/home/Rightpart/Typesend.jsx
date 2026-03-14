import React, { useState, useRef } from "react";
import { IoSend } from "react-icons/io5";
import { BsEmojiSmile } from "react-icons/bs";
import EmojiPicker from "emoji-picker-react";
import useSendMessage from "../../context/useSendMessage";
import { useSocketContext } from "../../context/SocketContext";
import useConversation from "../../statemanage/useConversation";

function Typesend() {
  const [message, setMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);

  const { sendMessages } = useSendMessage();
  const { socket } = useSocketContext();
  const { selectedConversation } = useConversation();

  const inputRef = useRef();
  const typingTimeout = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    await sendMessages(message);
    setMessage("");

    socket.emit("stopTyping", selectedConversation._id);
  };

  const handleEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
    inputRef.current.focus();
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);

    if (!selectedConversation) return;

    socket.emit("typing", selectedConversation._id);

    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      socket.emit("stopTyping", selectedConversation._id);
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="relative">

      {showEmoji && (
        <div className="absolute bottom-16 left-2 z-50">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}

      <div className="flex items-center gap-2 px-3 md:px-4 py-3 bg-gray-800">

        <button
          type="button"
          onClick={() => setShowEmoji(!showEmoji)}
          className="text-2xl text-gray-300 hover:text-yellow-400"
        >
          <BsEmojiSmile />
        </button>

        <input
          ref={inputRef}
          type="text"
          placeholder="Type message..."
          value={message}
          onChange={handleTyping}
          className="
            flex-1
            bg-slate-900
            text-white
            placeholder-gray-400
            border border-gray-700
            rounded-lg
            px-3 py-2
            outline-none
            focus:border-blue-500
          "
        />

        <button
          className="
            p-2
            bg-blue-500
            hover:bg-blue-600
            rounded-lg
            text-white
            transition
          "
        >
          <IoSend className="text-xl" />
        </button>

      </div>
    </form>
  );
}

export default Typesend;