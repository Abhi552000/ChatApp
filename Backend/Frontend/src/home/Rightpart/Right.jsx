import React, { useEffect } from "react";
import Chatuser from "./Chatuser";
import Messages from "./Messages";
import Typesend from "./Typesend";
import useConversation from "../../statemanage/useConversation";
import { useAuth } from "../../context/AuthProvider";
import { CiMenuFries } from "react-icons/ci";

function Right() {
  const { selectedConversation } = useConversation();

  return (
    <div className="w-full h-screen flex flex-col bg-themeBgPrimary text-themeTextPrimary">
      {!selectedConversation ? (
        <NoChatSelected />
      ) : (
        <>
          <Chatuser />

          <div className="flex-1 overflow-y-auto">
            <Messages />
          </div>

          <Typesend />
        </>
      )}
    </div>
  );
}

export default Right;

const NoChatSelected = () => {
  const [authUser] = useAuth();

  return (
    <div className="flex items-center justify-center h-full text-center px-4 bg-themeBgPrimary text-themeTextPrimary">
      <h1 className="text-lg md:text-xl text-themeTextSecondary">
        Welcome{" "}
        <span className="font-bold text-themeTextPrimary">{authUser?.user?.fullname}</span>
        <br />
        <span className="text-sm font-normal">Select a conversation to start messaging</span>
      </h1>
    </div>
  );
};
