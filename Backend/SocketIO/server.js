import { Server } from "socket.io";
import http from "http";
import express from "express";
import User from "../models/user.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["https://chatterbox-9aw1.onrender.com", "http://localhost:5173"],
    methods: ["GET", "POST"],
  },
});

const users = {};

// get receiver socket id
export const getReceiverSocketId = (receiverId) => {
  return users[receiverId];
};

// socket connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  const userId = socket.handshake.query.userId;

  if (userId) {
    users[userId] = socket.id;
    console.log("Connected Users:", users);
  }

  // send online users list
  io.emit("getOnlineUsers", Object.keys(users));

  socket.on("typing", (receiverId) => {
    const receiverSocketId = users[receiverId];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing");
    }
  });

  socket.on("stopTyping", (receiverId) => {
    const receiverSocketId = users[receiverId];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping");
    }
  });

  socket.on("messageSeen", ({ senderId }) => {
    const senderSocketId = users[senderId];

    if (senderSocketId) {
      io.to(senderSocketId).emit("messageSeen", {
        senderId,
      });
    }
  });

  socket.on("disconnect", async () => {
    console.log("User disconnected:", socket.id);

    delete users[userId];

    if (userId) {
      await User.findByIdAndUpdate(userId, {
        lastSeen: new Date(),
      });
    }

    io.emit("getOnlineUsers", Object.keys(users));
  });
});

export { app, io, server };
