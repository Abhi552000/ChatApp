import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
export const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
  const initialUserState = localStorage.getItem("ChatApp");

  // parse the user data and storing in state.
  const [authUser, setAuthUser] = useState(
    initialUserState ? JSON.parse(initialUserState) : undefined
  );

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("ChatApp");
          setAuthUser(undefined);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  return (
    <AuthContext.Provider value={[authUser, setAuthUser]}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
