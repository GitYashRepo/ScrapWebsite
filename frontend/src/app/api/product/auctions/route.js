import connectDB from "@/lib/db/db";
import Product from "@/models/product/product";
import Category from "@/models/category/category";
import { getToken } from "next-auth/jwt";



// ✅ GET: All Auction Products (for buyers)
export async function GET(req) {
  try {
    await connectDB();

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized: Sellers only" }), { status: 403 });
    }

    let auctionProducts;

    if (token.role === "buyer") {
         auctionProducts = await Product.find({ status: "available", isAuction: true })
            .populate("category") // populate full category document
            .populate("seller")   // ✅ populate entire seller document (all fields)
            .sort({ createdAt: -1 });
    }

    return new Response(JSON.stringify(auctionProducts), { status: 200 });
  } catch (error) {
    console.error("Error fetching auction products:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
