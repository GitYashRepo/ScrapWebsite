import connectDB from "@/lib/db/db";
import ChatSession from "@/models/chat/chatSession";
import message from "@/models/chat/message";
import Message from "@/models/chat/message";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { buyerId, sellerId, productId, text, senderModel } = body;

    if (!buyerId || !sellerId || !productId || !text || !senderModel) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Find or create chat session
    let session = await ChatSession.findOne({ buyer: buyerId, seller: sellerId, product: productId });
    if (!session) {
      session = await ChatSession.create({ buyer: buyerId, seller: sellerId, product: productId });
    }

     const msg = await Message.create({
      session: session._id,
      sender: senderModel === "Seller" ? sellerId : buyerId,
      senderModel: senderModel || "Buyer",
      message: text,
    });

     // 🧠 STEP 3 — Update session timestamp
    session.updatedAt = new Date();
    await session.save();


    return NextResponse.json({ success: true, sessionId: session._id, message: msg });
  } catch (err) {
    console.error("send message error", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
