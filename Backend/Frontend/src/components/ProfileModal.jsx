import React, { useState } from "react";
import { useAuth } from "../context/AuthProvider";
import axios from "axios";
import toast from "react-hot-toast";
import { IoClose } from "react-icons/io5";
import { TbLogout2 } from "react-icons/tb";

const PRESET_AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Garfield",
  "https://api.dicebear.com/7.x/lorelei/svg?seed=Nala",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Buster",
  "https://api.dicebear.com/7.x/personas/svg?seed=Caleb"
];

function ProfileModal({ onClose }) {
  const [authUser, setAuthUser] = useAuth();
  
  const user = authUser?.user || {};
  
  const [fullname, setFullname] = useState(user.fullname || "");
  const [about, setAbout] = useState(user.about || "Hey there! I am using Messenger.");
  const [avatar, setAvatar] = useState(user.avatar || "");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [loading, setLoading] = useState(false);

  const handleThemeChange = (e) => {
    const selectedTheme = e.target.value;
    setTheme(selectedTheme);
    localStorage.setItem("theme", selectedTheme);
    document.documentElement.setAttribute("data-theme", selectedTheme);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!fullname.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.put("/api/user/update", {
        fullname,
        about,
        avatar
      });
      
      if (response.data?.user) {
        const updatedAuthUser = { ...authUser, user: response.data.user };
        setAuthUser(updatedAuthUser);
        localStorage.setItem("ChatApp", JSON.stringify(updatedAuthUser));
        toast.success("Profile updated successfully!");
        onClose();
      }
    } catch (error) {
      console.error("Failed to update profile", error);
      toast.error(error.response?.data?.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 text-gray-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
          <h2 className="text-xl font-bold text-white">Profile Settings</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white p-1 hover:bg-slate-800 rounded-full transition-colors"
          >
            <IoClose className="text-2xl" />
          </button>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-blue-500 bg-slate-800 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                {avatar ? (
                  <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  fullname.slice(0, 2).toUpperCase()
                )}
              </div>
            </div>
            
            {/* Presets */}
            <div className="w-full text-center">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold block mb-2">
                Choose an Avatar Preset
              </span>
              <div className="flex justify-center gap-2 flex-wrap">
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatar(url)}
                    className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all hover:scale-105 ${
                      avatar === url ? "border-blue-500 scale-110 shadow-md" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={url} alt={`Preset ${idx}`} className="w-full h-full object-cover bg-slate-800" />
                  </button>
                ))}
              </div>
            </div>

            {/* Custom URL */}
            <div className="w-full">
              <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold block mb-1">
                Custom Avatar Image URL (Optional)
              </label>
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Email (Read Only) */}
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold block mb-1">
                Email Address (Permanent)
              </label>
              <input
                type="text"
                value={user.email || ""}
                disabled
                className="w-full px-3 py-2 bg-slate-800/40 border border-slate-800/80 rounded-lg text-sm text-gray-500 cursor-not-allowed focus:outline-none"
              />
            </div>

            {/* Fullname */}
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold block mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Your name"
              />
            </div>

            {/* About / Status */}
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold block mb-1">
                Status / About
              </label>
              <input
                type="text"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Hey there! I am using Messenger."
              />
            </div>

            {/* Theme Mode */}
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold block mb-1">
                Theme Mode
              </label>
              <select
                value={theme}
                onChange={handleThemeChange}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                <option value="dark">Dark Theme</option>
                <option value="light">Light Theme</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex flex-col gap-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50"
            >
              {loading ? "Saving Changes..." : "Save Profile"}
            </button>

            {/* Logout Mobile */}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-2.5 bg-slate-800 hover:bg-red-950/40 border border-slate-700 hover:border-red-900 text-gray-300 hover:text-red-400 font-semibold rounded-lg flex items-center justify-center gap-2 transition-all duration-300"
            >
              <TbLogout2 className="text-lg" />
              <span>Log Out</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default ProfileModal;
