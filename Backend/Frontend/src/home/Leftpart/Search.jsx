import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import useGetAllUsers from "../../context/useGetAllUsers";
import useConversation from "../../statemanage/useConversation";
import toast from "react-hot-toast";

function Search() {
  const [search, setSearch] = useState("");
  const [allUsers] = useGetAllUsers();
  const { setSelectedConversation } = useConversation();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!search) return;

    const conversation = allUsers.find((user) =>
      user.fullname?.toLowerCase().includes(search.toLowerCase())
    );

    if (conversation) {
      setSelectedConversation(conversation);
      setSearch("");
    } else {
      toast.error("User not found");
    }
  };

  return (
    <div className="px-4 py-3">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 bg-slate-900 border border-gray-700 rounded-lg px-3 py-2 outline-none"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button>
              <FaSearch className="text-4xl p-2 hover:bg-gray-600 rounded-full duration-300" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default Search;
