import connectDB from "@/lib/db/db";
import Seller from "@/models/user/seller";
import Buyer from "@/models/buyer/buyer";
import { getToken } from "next-auth/jwt";

export async function GET(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== "admin")
      return new Response(JSON.stringify({ error: "Unauthorized: Admins only" }), { status: 403 });

    await connectDB();
    const sellers = await Seller.find();
    const buyers = await Buyer.find();

    return new Response(JSON.stringify({ sellers, buyers }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
