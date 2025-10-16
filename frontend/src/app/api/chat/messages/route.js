import { NextResponse } from "next/server";
import connectDB from "@/lib/db/db";
import Message from "@/models/chat/message";

export async function POST(req) {
  try {
    const { sessionId } = await req.json();
    await connectDB();

    const messages = await Message.find({ session: sessionId }).sort("createdAt");

    return NextResponse.json({ messages });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load messages" }, { status: 500 });
  }
}
