import connectDB from "@/lib/db/db";
import ChatSession from "@/models/chat/chatSession";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get("sellerId");
    if (!sellerId)
      return new Response(JSON.stringify({ error: "Missing sellerId" }), { status: 400 });

    const sessions = await ChatSession.find({ seller: sellerId })
      .populate("buyer")
      .populate("product")
      .sort({ updatedAt: -1 });

    console.log("🔍 Found sessions:", sessions.length);

    const buyersMap = {};
    sessions.forEach((s) => {
      const b = s.buyer;
      if (!b) return;

      if (!buyersMap[b._id]) {
        buyersMap[b._id] = {
          _id: b._id,
          name: b.name,
          email: b.email,
          products: [],
        };
      }
      buyersMap[b._id].products.push({
        sessionId: s._id,
        productId: s.product?._id,
        name: s.product?.name,
        pricePerKg: s.product?.pricePerKg,
        updatedAt: s.updatedAt,
      });
    });

    return new Response(JSON.stringify(Object.values(buyersMap)), { status: 200 });
  } catch (err) {
    console.error("❌ seller-sessions error", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
