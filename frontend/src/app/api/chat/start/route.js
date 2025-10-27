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

    // ✅ Fetch product
    const product = await Product.findById(productId).populate("seller");
    if (!product) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    // ✅ Get seller from product
    const sellerId = product.seller?._id || product.owner || product.createdBy;
    if (!sellerId) {
      return Response.json({ error: "Seller not linked with product" }, { status: 400 });
    }

    // ✅ Fetch buyer
    const buyer = await Buyer.findById(buyerId);
    if (!buyer) {
      return Response.json({ error: "Buyer not found" }, { status: 404 });
    }

    // ✅ Check existing session
    let session = await ChatSession.findOne({ buyer: buyerId, seller: sellerId, product: productId });
    if (!session) {
      session = await ChatSession.create({
        buyer: buyerId,
        seller: sellerId,
        product: productId,
      });
    }

     return NextResponse.json({
      sessionId: session._id,
      product,
      seller: {
        _id: product.seller._id,
        storeName: product.seller.storeName,
        ownerName: product.seller.ownerName,
        email: product.seller.email,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to start chat" }, { status: 500 });
  }
}
