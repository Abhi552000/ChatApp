import React from "react";
import Left from "./home/Leftpart/Left";
import Right from "./home/Rightpart/Right";
import Signup from "./components/Signup";
import Login from "./components/Login";
import VerifyOTP from "./components/VerifyOTP";
import { useAuth } from "./context/AuthProvider";
import { Toaster } from "react-hot-toast";
import Logout from "./home/left1/Logout";
import useConversation from "./statemanage/useConversation";
import { Navigate, Route, Routes } from "react-router-dom";

function ChatLayout() {
  const { selectedConversation } = useConversation();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-themeBgPrimary text-themeTextPrimary">

      {/* Desktop logout sidebar */}
      <div className="hidden lg:flex">
        <Logout />
      </div>

      <div className="flex w-full">

        {/* USERS LIST */}
        <div
          className={`
          w-full md:w-[35%] lg:w-[30%]
          ${selectedConversation ? "hidden md:block" : "block"}
        `}
        >
          <Left />
        </div>

        {/* CHAT WINDOW */}
        <div
          className={`
          w-full flex-1
          ${!selectedConversation ? "hidden md:flex" : "flex"}
        `}
        >
          <Right />
        </div>

      </div>
    </div>
  );
}

function App() {
  const [authUser] = useAuth();

  React.useEffect(() => {
    const currentTheme = localStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("data-theme", currentTheme);
  }, []);

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            authUser ? (
              authUser.user.isVerified ? <ChatLayout /> : <Navigate to="/verify-otp" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/verify-otp"
          element={
            authUser ? (
              authUser.user.isVerified ? <Navigate to="/" /> : <VerifyOTP />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/login"
          element={
            authUser ? (
              authUser.user.isVerified ? <Navigate to="/" /> : <Navigate to="/verify-otp" />
            ) : (
              <Login />
            )
          }
        />

        <Route
          path="/signup"
          element={
            authUser ? (
              authUser.user.isVerified ? <Navigate to="/" /> : <Navigate to="/verify-otp" />
            ) : (
              <Signup />
            )
          }
        />
      </Routes>

      <Toaster />
    </>
  );
}

export default App;