import connectDB from "@/lib/db/db";
import ChatSession from "@/models/chat/chatSession";
import Message from "@/models/chat/message";
import { NextResponse } from "next/server";



export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { buyerId, sellerId, productId, text } = body;

    if (!buyerId || !sellerId || !productId || !text) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 🧠 STEP 1 — Create or fetch chat session
    let session = await ChatSession.findOne({ buyer: buyerId, seller: sellerId, product: productId });

    if (!session) {
      session = await ChatSession.create({
        buyer: buyerId,
        seller: sellerId,
        product: productId,
      });
    }

    // 🧠 STEP 2 — Save message (optional if you’re using Socket.IO only)
    const message = await Message.create({
      session: session._id,
      sender: senderModel === "Seller" ? sellerId : buyerId,
      senderModel: senderModel || "Buyer",
      message: text,
    });

     // 🧠 STEP 3 — Update session timestamp
    session.updatedAt = new Date();
    await session.save();


    return NextResponse.json({ success: true, sessionId: session._id, message });
  } catch (err) {
    console.error("send message error", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
