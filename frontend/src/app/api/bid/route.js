import connectDB from "@/lib/db/db";
import Buyer from "@/models/buyer/buyer";
import Bid from "@/models/bid/bid";
import Product from "@/models/product/product";
import { getToken } from "next-auth/jwt";

export async function POST(req) {
  try {
    await connectDB();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== "buyer") {
      return new Response(
        JSON.stringify({ error: "Only buyers can place bids" }),
        { status: 403 }
      );
    }

    const { productId, amount } = await req.json();

    if (!productId || !amount)
      return new Response(
        JSON.stringify({ error: "Product ID and amount are required" }),
        { status: 400 }
      );

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product || !product.isAuction) {
      return new Response(
        JSON.stringify({ error: "Invalid or non-auction product" }),
        { status: 404 }
      );
    }

    const newBid = await Bid.create({
      product: productId,
      buyer: token.id,
      amount,
    });

    return new Response(JSON.stringify(newBid), { status: 201 });
  } catch (error) {
    console.error("Bid creation failed:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId)
      return new Response(
        JSON.stringify({ error: "Product ID is required" }),
        { status: 400 }
      );

    const bids = await Bid.find({ product: productId })
      .populate("buyer", "name email address city pinCode phone")
      .sort({ amount: -1, createdAt: -1 });

    return new Response(JSON.stringify(bids), { status: 200 });
  } catch (error) {
    console.error("Error fetching bids:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
