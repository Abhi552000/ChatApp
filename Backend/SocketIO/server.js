import { Server } from "socket.io";
import http from "http";
import express from "express";

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
  console.log("a user connected", socket.id);

  const userId = socket.handshake.query.userId;

  if (userId) {
    users[userId] = socket.id;
    console.log("Connected Users:", users);
  }

  // send online users list
  io.emit("getOnlineUsers", Object.keys(users));

  // TYPING EVENT
  socket.on("typing", (receiverId) => {
    const receiverSocketId = users[receiverId];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing");
    }
  });

  // STOP TYPING EVENT
  socket.on("stopTyping", (receiverId) => {
    const receiverSocketId = users[receiverId];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping");
    }
  });

  // NEW: MESSAGE SEEN EVENT
  socket.on("messageSeen", (receiverId) => {
    const receiverSocketId = users[receiverId];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageSeen");
    }
  });

  // disconnect
  socket.on("disconnect", () => {
    console.log("a user disconnected", socket.id);

    delete users[userId];

    io.emit("getOnlineUsers", Object.keys(users));
  });
});

export { app, io, server };