import React, { useState } from "react";
import useConversation from "../statemanage/useConversation.js";
import axios from "axios";
const useSendMessage = () => {
  const [loading, setLoading] = useState(false);
  const { messages, setMessage, selectedConversation, setAllUsers } =
    useConversation();
  const sendMessages = async (message) => {
    setLoading(true);
    try {
      const res = await axios.post(
        `/api/message/send/${selectedConversation._id}`,
        { message }
      );

      const newMessage = res.data;
      setMessage((prev) => [...prev, newMessage]);

      // Update lastMessage inside allUsers list in Zustand
      setAllUsers((prevUsers) => {
        if (!Array.isArray(prevUsers)) return [];
        return prevUsers.map((u) =>
          String(u._id) === String(selectedConversation._id)
            ? { ...u, lastMessage: newMessage }
            : u
        );
      });

      setLoading(false);
    } catch (error) {
      console.log("Error in send messages", error);
      setLoading(false);
    }
  };
  return { loading, sendMessages };
};

export default useSendMessage;
