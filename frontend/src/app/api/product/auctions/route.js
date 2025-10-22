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
      return new Response(
        JSON.stringify({ error: "Unauthorized: Please log in first." }),
        { status: 401 }
      );
    }


    // ✅ Allow only buyer, seller, or admin roles
    const allowedRoles = ["buyer", "seller", "admin"];
    const userRole = token.role?.toLowerCase();

    if (!allowedRoles.includes(userRole)) {
      return new Response(
        JSON.stringify({ error: "Access denied. Invalid role." }),
        { status: 403 }
      );
    }

    // ✅ Role-based query
    // - Buyers & Sellers → only see available auction products
    // - Admin → sees all auction products
    const query =
    userRole === "admin"
      ? { isAuction: true }
      : userRole === "seller"
      ? { isAuction: true, seller: token.id } // only their own auctions
      : { isAuction: true, status: "available" };

    // ✅ Fetch auctions and populate related data
    const auctionProducts = await Product.find(query)
      .populate("category") // full category details
      .populate("seller")   // seller info (storeName, name, etc.)
      .sort({ createdAt: -1 });

    return new Response(JSON.stringify(auctionProducts), { status: 200 });
  } catch (error) {
    console.error("Error fetching auction products:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
