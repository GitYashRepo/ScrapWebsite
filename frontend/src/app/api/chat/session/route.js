import connectDB from "@/lib/db/db";
import ChatSession from "@/models/chat/chatSession";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");
    if (!sessionId) return new Response(JSON.stringify({ error: "Missing sessionId" }), { status: 400 });

    const session = await ChatSession.findById(sessionId)
      .populate("buyer", "name email")
      .populate("product", "name pricePerKg")
      .lean()
    if (!session) return new Response(JSON.stringify({ error: "Session not found" }), { status: 404 });

    return NextResponse.json({
      buyer: session.buyer,
      product: session.product,
      sessionId: session._id,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load session", details: error.message }, { status: 500 })
  }
}
