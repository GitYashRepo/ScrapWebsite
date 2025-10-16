// src/pages/api/socket.js
import { Server } from "socket.io";
import mongoose from "mongoose";
import connectDB from "@/lib/db/db";
import Message from "@/models/chat/message";
import ChatSession from "@/models/chat/chatSession";

export default async function SocketHandler(req, res) {
  if (!res.socket.server.io) {
    console.log("🔌 Setting up Socket.io");

    const io = new Server(res.socket.server, {
      path: "/api/socket",
      cors: {
        origin: "*",
      },
    });

    io.on("connection", (socket) => {
      console.log("⚡ Socket connected:", socket.id);

      socket.on("joinRoom", (sessionId) => {
        socket.join(sessionId);
        console.log(`✅ Joined room ${sessionId}`);
      });

      socket.on("sendMessage", async (data) => {
        try {
          await connectDB();

          const { buyerId, sellerId, productId, message, senderModel } = data;
          if (!buyerId || !sellerId || !productId) {
            console.log("❌ Missing IDs", data);
            return;
          }

          // 🔹 1. Find or create ChatSession
          let session = await ChatSession.findOne({
            buyer: buyerId,
            seller: sellerId,
            product: productId,
          });

          if (!session) {
            session = await ChatSession.create({
              buyer: buyerId,
              seller: sellerId,
              product: productId,
            });
            console.log("🆕 New ChatSession created:", session._id);
          } else {
            console.log("📂 Found existing ChatSession:", session._id);
          }

          // 🔹 2. Save message
          const msg = await Message.create({
            session: session._id,
            sender: buyerId,
            message,
            senderModel: senderModel || "Buyer",
          });

          // 🔹 3. Update session timestamp
          session.updatedAt = new Date();
          await session.save();

          const roomId = `${buyerId}_${sellerId}_${productId}`;
          io.to(roomId).emit("receiveMessage", {
            _id: message._id,
            sender: message.sender,
            senderModel: message.senderModel,
            message: message.message,
            time: new Date().toLocaleTimeString(),
          });
        } catch (err) {
          console.error("Socket sendMessage error", err);
        }
      });

      socket.on("disconnect", () => {
        console.log("❌ Socket disconnected:", socket.id);
      });
    });

    res.socket.server.io = io;
  }

  res.end();
}
