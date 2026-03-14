import React, { useState } from "react";
import { TbLogout2 } from "react-icons/tb";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

function Logout() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await axios.post("/api/user/logout");

      localStorage.removeItem("ChatApp");
      Cookies.remove("jwt");

      toast.success("Logged out successfully");

      window.location.reload();
    } catch (error) {
      toast.error("Error in logging out");
    }

    setLoading(false);
  };

  return (
    <div className="hidden md:flex w-[70px] bg-slate-950 text-white flex-col justify-end">
      <div className="p-3">
        <button onClick={handleLogout}>
          <TbLogout2 className="text-4xl p-2 hover:bg-gray-600 rounded-lg duration-300" />
        </button>
      </div>
    </div>
  );
}

export default Logout;
