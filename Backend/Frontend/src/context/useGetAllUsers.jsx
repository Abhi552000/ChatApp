import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import useConversation from "../statemanage/useConversation.js";

function useGetAllUsers() {
  const { allUsers, setAllUsers } = useConversation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getUsers = async () => {
      setLoading(true);
      try {
        const token = Cookies.get("jwt");
        const response = await axios.get("/api/user/allusers", {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAllUsers(response.data);
        setLoading(false);
      } catch (error) {
        console.log("Error in useGetAllUsers: " + error);
        setLoading(false);
      }
    };
    getUsers();
  }, [setAllUsers]);

  return [allUsers, loading];
}

export default useGetAllUsers;
