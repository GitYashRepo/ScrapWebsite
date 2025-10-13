import connectDB from "@/lib/db/db";
import Product from "@/models/product";
import { getToken } from "next-auth/jwt";

// ✅ GET: All products (public - buyers can view)
export async function GET() {
  try {
    await connectDB();
    const products = await Product.find().populate("category seller", "name storeName email");
    return new Response(JSON.stringify(products), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

// ✅ POST: Add product (Seller only)
export async function POST(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== "seller") {
      return new Response(JSON.stringify({ error: "Unauthorized: Sellers only" }), { status: 403 });
    }

    await connectDB();
    const { name, description, price, quantity, category, images } = await req.json();

    if (!name || !price || !quantity || !category)
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });

    const product = await Product.create({
      name,
      description,
      price,
      quantity,
      images,
      category,
      seller: token.id,
    });

    return new Response(JSON.stringify({ message: "Product added", product }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
