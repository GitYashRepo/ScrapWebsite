import connectDB from "@/lib/db/db";
import Order from "@/models/order/order";
import { getToken } from "next-auth/jwt";

export async function GET(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== "admin")
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });

    await connectDB();
    const orders = await Order.find()
      .populate("buyer", "name email companyName")
      .populate("seller", "storeName email")
      .populate("items.product", "name price");

    return new Response(JSON.stringify(orders), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
