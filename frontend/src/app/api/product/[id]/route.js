import connectDB from "@/lib/db/db";
import Product from "@/models/product/product";
import { getToken } from "next-auth/jwt";

// ✅ PATCH: Update Product (Seller only)
export async function PATCH(req, { params }) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== "seller") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
    }

    await connectDB();
    const { id } = params;
    const body = await req.json();

    const product = await Product.findOneAndUpdate(
      { _id: id, seller: token.id },
      body,
      { new: true }
    );

    if (!product)
      return new Response(JSON.stringify({ error: "Product not found or unauthorized" }), { status: 404 });

    return new Response(JSON.stringify({ message: "Product updated", product }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

// ✅ DELETE: Delete Product (Seller only)
export async function DELETE(req, { params }) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== "seller") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
    }

    await connectDB();
    const { id } = params;

    const product = await Product.findOneAndDelete({ _id: id, seller: token.id });
    if (!product)
      return new Response(JSON.stringify({ error: "Product not found" }), { status: 404 });

    return new Response(JSON.stringify({ message: "Product deleted" }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
