import { Server } from "socket.io";
import connectDB from "@/lib/db/db";
import Message from "@/models/chat/message";
import ChatSession from "@/models/chat/chatSession";

let io;

export default async function SocketHandler(req, res) {
  // Only setup Socket.IO once
  if (!res.socket.server.io) {
    console.log("🔌 Setting up Socket.IO...");

    io = new Server(res.socket.server, {
      path: "/api/socket",
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("⚡ Socket connected:", socket.id);

      // Join room
      socket.on("joinRoom", (roomId) => {
        if (!roomId) return;
        socket.join(roomId);
        console.log(`✅ Socket ${socket.id} joined room ${roomId}`);
      });

      // Send message
      socket.on("sendMessage", async (data) => {
        try {
          await connectDB();

          const { buyerId, sellerId, productId, message, senderModel } = data;
          if (!buyerId || !sellerId || !productId || !message) return;

          // Find or create ChatSession
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

          // Emit to room
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

          // Acknowledge to sender
          socket.emit("messageSaved", { ok: true, message: msg });
        } catch (err) {
          console.error("Socket sendMessage error:", err);
        }
      });

      socket.on("disconnect", () => {
        console.log("❌ Socket disconnected:", socket.id);
      });
    });
  }

  res.end();
}
