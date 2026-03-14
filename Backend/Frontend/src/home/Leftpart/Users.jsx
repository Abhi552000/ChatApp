import React from "react";
import User from "./User";
import useGetAllUsers from "../../context/useGetAllUsers";
import useConversation from "../../statemanage/useConversation";

function Users() {
  const [allUsers] = useGetAllUsers();
  const { selectedConversation } = useConversation();

  return (
    <div className="flex flex-col h-full">

      <h1 className="px-6 py-2 font-semibold bg-slate-800">
        Messages
      </h1>

      <div className="flex-1 overflow-y-auto">
        {allUsers.map((user) => (
          <User
            key={user._id}
            user={user}
            active={selectedConversation?._id === user._id}
          />
        ))}
      </div>

    </div>
  );
}

export default Users;