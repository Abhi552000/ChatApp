import React, { useState } from "react";
import Search from "./Search";
import Users from "./Users";
import { useAuth } from "../../context/AuthProvider";
import ProfileModal from "../../components/ProfileModal";
import { FiSettings } from "react-icons/fi";
import { TbLogout2 } from "react-icons/tb";
import axios from "axios";
import toast from "react-hot-toast";

function Left() {
  const [authUser, setAuthUser] = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const user = authUser?.user || {};

  const handleLogout = async () => {
    try {
      await axios.post("/api/user/logout");
      localStorage.removeItem("ChatApp");
      setAuthUser(undefined);
      toast.success("Logged out successfully");
      window.location.reload();
    } catch (error) {
      toast.error("Error in logging out");
    }
  };

  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="w-full md:w-full bg-themeBgSecondary text-themeTextPrimary h-screen flex flex-col relative border-r border-themeBorder">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-themeBorder bg-themeBgHeader">
        
        {/* User Info & Title */}
        <div className="flex items-center space-x-3">
          {/* Clickable Profile Avatar */}
          <button
            onClick={() => setIsProfileOpen(true)}
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-themeBorder bg-themeBgInput flex items-center justify-center text-sm font-bold text-themeTextPrimary hover:border-blue-500 hover:scale-105 active:scale-95 transition-all duration-200"
            title="Edit Profile"
          >
            {user.avatar ? (
              <img src={user.avatar} alt="Me" className="w-full h-full object-cover" />
            ) : (
              getInitials(user.fullname)
            )}
          </button>
          <h1 className="font-bold text-xl text-themeTextPrimary">Chats</h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Settings button */}
          <button
            onClick={() => setIsProfileOpen(true)}
            className="p-2 hover:bg-themeBgHover rounded-full text-themeTextSecondary hover:text-themeTextPrimary transition-colors"
            title="Settings"
          >
            <FiSettings className="text-xl" />
          </button>

          {/* Logout button (hidden on desktop/laptop where sidebar logout exists) */}
          <button
            onClick={handleLogout}
            className="lg:hidden p-2 hover:bg-red-950/20 rounded-full text-themeTextSecondary hover:text-red-500 transition-colors"
            title="Log Out"
          >
            <TbLogout2 className="text-xl" />
          </button>
        </div>
      </div>

      <Search searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <div className="flex-1 overflow-y-auto">
        <Users searchQuery={searchQuery} />
      </div>

      {/* Profile Settings Modal Overlay */}
      {isProfileOpen && <ProfileModal onClose={() => setIsProfileOpen(false)} />}
    </div>
  );
}

export default Left;
