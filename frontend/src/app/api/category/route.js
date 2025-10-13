import connectDB from "@/lib/db/db";
import Category from "@/models/category/category";
import { getToken } from "next-auth/jwt";

// ✅ GET: Fetch all categories
export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find().sort({ createdAt: -1 });
    return new Response(JSON.stringify(categories), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

// ✅ POST: Create a new category (Admin only)
export async function POST(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Admin access only" }),
        { status: 403 }
      );
    }

    await connectDB();
    const { name, description, image } = await req.json();

    if (!name || !image)
      return new Response(
        JSON.stringify({ error: "Name and image are required" }),
        { status: 400 }
      );

    const exists = await Category.findOne({ name });
    if (exists)
      return new Response(
        JSON.stringify({ error: "Category already exists" }),
        { status: 400 }
      );

    const category = await Category.create({ name, description, image });
    return new Response(JSON.stringify({ message: "Category created", category }), {
      status: 201,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
