import 'dotenv/config';
import express from "express";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./src/lib/db/db.js";
import Message from "./src/models/chat/message.js";
import ChatSession from "./src/models/chat/chatSession.js";
import emailjs from "emailjs-com";
import Seller from "./src/models/user/seller.js";
import Buyer from "./src/models/buyer/buyer.js";
import Product from "./src/models/product/product.js";

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000" , "https://kabaadimandi.vercel.app" , "https://www.kabaadmandi.com"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// 🟢 Track online users (by seller/buyer ID)
const onlineUsers = new Map();

io.on("connection", (socket) => {

   // Track user identity for online detection
  const { userId, userRole } = socket.handshake.query || {};
  socket.userId = userId;
  socket.userRole = userRole;
  socket.on("joinRoom", (roomId) => {
    if (!roomId) return;
    socket.join(roomId);
  });

  socket.on("sendMessage", async (data) => {
    try {
      await connectDB();

      const { buyerId, sellerId, productId, message, senderModel } = data;
      if (!buyerId || !sellerId || !productId || !message) return;

      // Find or create chat session
      let session = await ChatSession.findOne({ buyer: buyerId, seller: sellerId, product: productId });
      if (!session) {
        session = await ChatSession.create({ buyer: buyerId, seller: sellerId, product: productId });
      }

      // Save message
      const msg = await Message.create({
        session: session._id,
        sender: senderModel === "Seller" ? sellerId : buyerId,
        message,
        senderModel: senderModel || "Buyer",
      });

      session.updatedAt = new Date();
      await session.save();

      // Emit message to room
      const roomIdStr = `${buyerId}_${sellerId}_${productId}`;
      io.to(roomIdStr).emit("receiveMessage", {
        _id: msg._id,
        session: session._id,
        sender: msg.sender,
        senderModel: msg.senderModel,
        message: msg.message,
        createdAt: msg.createdAt,
        time: new Date().toLocaleTimeString(),
      });

      // Ack to sender
      socket.emit("messageSaved", { ok: true, message: msg });

       // 🔍 Check if seller is online
      const sellerOnline = onlineUsers.has(String(sellerId));

      // 🔍 Check if buyer is online
      // const buyerOnline = onlineUsers.has(String(buyerId));

      // Notify the sender (buyer) if seller is offline
      socket.emit("sellerStatus", { sellerId, isOnline: sellerOnline });

      // Notify the sender (seller) if buyer is offline
      // socket.emit("buyerStatus", { buyerId, isOnline: buyerOnline });
    } catch (err) {
      console.error("Socket sendMessage error:", err);
    }
  });

   // --- Handle seller/buyer online status check
  socket.on("checkSellerStatus", ({ sellerId }, callback) => {
    const issellerOnline = onlineUsers.has(String(sellerId));
    callback(issellerOnline);
  });

//   socket.on("checkBuyerStatus", ({ buyerId }, callback) => {
//      const isbuyerOnline = onlineUsers.has(String(buyerId));
//      callback(isbuyerOnline);
//   });

  // --- On disconnect
  socket.on("disconnect", () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
    }
  });
});

// Start server
const PORT = process.env.PORT || 4040;
server.listen(PORT, () => {
  console.log(`🚀 Socket.IO server running on http://localhost:${PORT}`);
});
