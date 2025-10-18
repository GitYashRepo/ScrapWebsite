import { NextResponse } from "next/server";
import connectDB from "@/lib/db/db";
import Message from "@/models/chat/message";

export async function POST(req) {
  try {
    await connectDB();
    const { sessionId } = await req.json();
    if (!sessionId) return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });

    const messages = await Message.find({ session: sessionId }).sort({ createdAt: 1 }).lean();
    return NextResponse.json({ messages });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load messages" }, { status: 500 });
  }
}
