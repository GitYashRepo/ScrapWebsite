import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/db/db";
import Product from "@/models/product/product";

export async function POST(req) {
  try {
    await connectDB();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token.role !== "seller") {
      return new Response(JSON.stringify({ error: "Unauthorized: Sellers only" }), { status: 403 });
    }

    const { name, description, pricePerKg, quantity, category, images, auctionDurationHours } = await req.json();

    if (!name || !pricePerKg || !quantity || !category || !auctionDurationHours)
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });

    // 🕒 Minimum auction time = 24 hours
    if (auctionDurationHours < 24)
      return new Response(JSON.stringify({ error: "Auction duration must be at least 24 hours" }), { status: 400 });

    const now = new Date();
    const auctionEnd = new Date(now.getTime() + auctionDurationHours * 60 * 60 * 1000);

    const product = await Product.create({
      name,
      description,
      pricePerKg,
      quantity,
      images,
      category,
      seller: token.id,
      isAuction: true,
      auctionStart: now,
      auctionEnd,
    });

    return new Response(JSON.stringify({ message: "Auction product created", product }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
