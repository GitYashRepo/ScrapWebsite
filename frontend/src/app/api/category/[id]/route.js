import connectDB from "@/lib/db/db";
import Category from "@/models/category";
import { getToken } from "next-auth/jwt";

// ✅ PATCH: Update category (Admin only)
export async function PATCH(req, { params }) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Admin access only" }),
        { status: 403 }
      );
    }

    await connectDB();
    const { id } = params;
    const body = await req.json();

    const category = await Category.findByIdAndUpdate(id, body, { new: true });

    if (!category)
      return new Response(JSON.stringify({ error: "Category not found" }), {
        status: 404,
      });

    return new Response(JSON.stringify({ message: "Category updated", category }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

// ✅ DELETE: Remove category (Admin only)
export async function DELETE(req, { params }) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || token.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Admin access only" }),
        { status: 403 }
      );
    }

    await connectDB();
    const { id } = params;

    const category = await Category.findByIdAndDelete(id);

    if (!category)
      return new Response(JSON.stringify({ error: "Category not found" }), {
        status: 404,
      });

    return new Response(JSON.stringify({ message: "Category deleted" }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
