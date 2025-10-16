import { NextResponse } from "next/server";
import connectDB from "@/lib/db/db";
import ChatSession from "@/models/chat/chatSession";
import Product from "@/models/product/product";
import Buyer from "@/models/buyer/buyer";

export async function POST(req) {
  try {
    await connectDB();

    const { productId, buyerId } = await req.json();

    if (!productId || !buyerId) {
      return NextResponse.json({ error: "Missing productId or buyerId" }, { status: 400 });
    }

    const product = await Product.findById(productId).populate("seller");
    const buyer = await Buyer.findById(buyerId);

    if (!product || !buyer) {
      return NextResponse.json({ error: "Invalid product or buyer" }, { status: 400 });
    }

    // Find or create session
    let session = await ChatSession.findOne({
      buyer: buyer._id,
      seller: product.seller._id,
      product: product._id,
    });

    if (!session) {
      session = await ChatSession.create({
        buyer: buyer._id,
        seller: product.seller._id,
        product: product._id,
      });
    }

     return NextResponse.json({ sessionId: session._id, product: {
      _id: product._id,
      name: product.name,
      images: product.images?.slice(0,1) || [],
      pricePerKg: product.pricePerKg
    }, seller: { _id: product.seller._id, storeName: product.seller.storeName, ownerName: product.seller.ownerName } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to start chat" }, { status: 500 });
  }
}
