import React from "react";
import User from "./User";
import useGetAllUsers from "../../context/useGetAllUsers";
import useConversation from "../../statemanage/useConversation";

function Users({ searchQuery = "" }) {
  const [allUsers] = useGetAllUsers();
  const { selectedConversation } = useConversation();

  const filteredUsers = allUsers.filter((user) =>
    user.fullname?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort chats: those with the most recent messages go to the top
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
    const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
    return timeB - timeA; // Descending order (latest message on top)
  });

  return (
    <div className="flex flex-col h-full">
      <h1 className="px-6 py-2 font-semibold bg-themeBgHeader text-themeTextPrimary">
        Messages
      </h1>

      <div className="flex-1 overflow-y-auto">
        {sortedUsers.length > 0 ? (
          sortedUsers.map((user) => (
            <User
              key={user._id}
              user={user}
              active={selectedConversation?._id === user._id}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500 text-sm font-medium">
            <span>No users found</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Users;