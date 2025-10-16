import { Server } from "socket.io";
import connectDB from "@/lib/db/db";
import Message from "@/models/chat/message";

let io;

export async function GET(req) {
  if (!io) {
    io = new Server(globalThis.serverSocket || 3001, {
      cors: {
        origin: "*",
      },
    });

    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      socket.on("joinRoom", (sessionId) => {
        socket.join(sessionId);
      });

      socket.on("sendMessage", async (data) => {
        const { sessionId, sender, senderModel, message } = data;
        await connectDB();

        const newMessage = await Message.create({
          session: sessionId,
          sender,
          senderModel,
          message,
        });

        io.to(sessionId).emit("newMessage", newMessage);
      });

      socket.on("disconnect", () => {
        console.log("User disconnected");
      });
    });
  }

  return new Response("Socket server running", { status: 200 });
}
