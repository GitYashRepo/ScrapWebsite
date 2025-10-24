// src/app/api/admin/chats/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/db";
import ChatSession from "@/models/chat/chatSession";
import Seller from "@/models/user/seller";
import Buyer from "@/models/buyer/buyer";
import Product from "@/models/product/product";

export async function GET() {
  await connectDB();
  try {
    const chats = await ChatSession.find()
      .populate("seller", "ownerName email")
      .populate("buyer", "name email")
      .populate("product", "name")
      .sort({ createdAt: -1 });

    return NextResponse.json(chats);
  } catch (error) {
    console.error("Admin Chats Error:", error);
    return NextResponse.json({ error: "Failed to load chat data" }, { status: 500 });
  }
}
