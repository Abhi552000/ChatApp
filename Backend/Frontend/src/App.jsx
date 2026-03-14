import React from "react";
import Left from "./home/Leftpart/Left";
import Right from "./home/Rightpart/Right";
import Signup from "./components/Signup";
import Login from "./components/Login";
import { useAuth } from "./context/AuthProvider";
import { Toaster } from "react-hot-toast";
import Logout from "./home/left1/Logout";
import useConversation from "./statemanage/useConversation";
import { Navigate, Route, Routes } from "react-router-dom";

function ChatLayout() {
  const { selectedConversation } = useConversation();

  return (
    <div className="flex h-screen w-screen overflow-hidden">

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

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={authUser ? <ChatLayout /> : <Navigate to="/login" />}
        />

        <Route
          path="/login"
          element={authUser ? <Navigate to="/" /> : <Login />}
        />

        <Route
          path="/signup"
          element={authUser ? <Navigate to="/" /> : <Signup />}
        />
      </Routes>

      <Toaster />
    </>
  );
}

export default App;