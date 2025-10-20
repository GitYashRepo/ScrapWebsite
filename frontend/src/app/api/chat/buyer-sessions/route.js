// /app/api/chat/buyer-sessions/route.js
import connectDB from "@/lib/db/db";
import ChatSession from "@/models/chat/chatSession";
import Seller from "@/models/user/seller";       // ✅ Import Seller model
import Product from "@/models/product/product";     // ✅ Import Product model
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const buyerId = searchParams.get("buyerId");
    if (!buyerId) return new Response(JSON.stringify({ error: "Missing buyerId" }), { status: 400 });

    const sessions = await ChatSession.find({ buyer: buyerId })
      .populate("seller", "ownerName email")
      .populate("product", "name pricePerKg")
      .lean();

    if (!sessions || sessions.length === 0) return NextResponse.json([]);

    // Group sessions by seller
    const grouped = {};
    sessions.forEach((session) => {
      const seller = session.seller;
      const sellerId = seller._id.toString();

      if (!grouped[sellerId]) {
        grouped[sellerId] = {
           _id: sellerId,
          name: seller.ownerName,
          storeName: seller.storeName,
          email: seller.email,
          phone: seller.phone,
          products: [],
        };
      }

      grouped[sellerId].products.push({
        sessionId: session._id,
        name: session.product?.name || "Unknown Product",
        pricePerKg: session.product?.pricePerKg || 0,
      });
    });

    return NextResponse.json(Object.values(grouped));
  } catch (error) {
    console.error("Error fetching buyer sessions:", error);
    return NextResponse.json({ error: "Server error", details: error.message }, { status: 500 });
  }
}
