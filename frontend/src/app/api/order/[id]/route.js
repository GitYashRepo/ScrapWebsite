import connectDB from "@/lib/db/db";
import Order from "@/models/order/order";
import { getToken } from "next-auth/jwt";

// ✅ GET: View specific order (Buyer, Seller, or Admin)
export async function GET(req, { params }) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token)
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    await connectDB();
    const { id } = params;

    // Fetch the order with all relations
    const order = await Order.findById(id)
      .populate("buyer", "name email companyName phone")
      .populate("seller", "storeName email phone")
      .populate("items.product", "name price images description");

    if (!order)
      return new Response(JSON.stringify({ error: "Order not found" }), { status: 404 });

    // ✅ Access control:
    // Admin can access all orders
    if (token.role === "admin") {
      return new Response(JSON.stringify(order), { status: 200 });
    }

    // Buyer can only view their own order
    if (token.role === "buyer" && order.buyer._id.toString() === token.id) {
      return new Response(JSON.stringify(order), { status: 200 });
    }

    // Seller can only view orders of their products
    if (token.role === "seller" && order.seller._id.toString() === token.id) {
      return new Response(JSON.stringify(order), { status: 200 });
    }

    // Otherwise, block access
    return new Response(JSON.stringify({ error: "Access denied" }), { status: 403 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}


export async function PATCH(req, { params }) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    await connectDB();
    const { id } = params;
    const { status } = await req.json();

    const order = await Order.findById(id).populate("seller", "_id");

    if (!order)
      return new Response(JSON.stringify({ error: "Order not found" }), { status: 404 });

    if (
      token.role === "admin" ||
      (token.role === "seller" && order.seller._id.toString() === token.id)
    ) {
      order.status = status;
      await order.save();
      return new Response(JSON.stringify({ message: "Order status updated", order }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: "Access denied" }), { status: 403 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
