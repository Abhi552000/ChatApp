import React from "react";
import Search from "./Search";
import Users from "./Users";
import Logout from "../left1/Logout";

function Left() {
  return (
    <div className="w-full md:w-full bg-black text-gray-300 h-screen flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <h1 className="font-bold text-2xl">Chats</h1>

        {/* Logout button mobile */}
        <div className="lg:hidden">
          <Logout />
        </div>
      </div>

      <Search />

      <div className="flex-1 overflow-y-auto">
        <Users />
      </div>
    </div>
  );
}

export default Left;
