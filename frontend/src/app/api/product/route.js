import connectDB from "@/lib/db/db";
import Product from "@/models/product/product";
import Category from "@/models/category/category";
import { getToken } from "next-auth/jwt";



// ✅ GET: All products (public - buyers can view)
export async function GET(request) {
  try {
    await connectDB();

    // ✅ Parse query params
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
     // 🟢 Public (unauthenticated) access — allow browsing by category
    if (!token) {
      const filter = categoryId ? { category: categoryId, status: "available" } : { status: "available" };
      const publicProducts = await Product.find(filter)
        .populate("category seller", "name storeName email")
        .sort({ createdAt: -1 });
      return new Response(JSON.stringify(publicProducts), { status: 200 });
    }

    let products;

    // 🔹 If seller → show only their own products
    if (token.role === "seller") {
      products = await Product.find({ seller: token.id })
        .populate("category seller", "name storeName email");
    }
    // 🔹 Buyer → show available non-auction products
    else if (token.role === "buyer") {
      const filter = {
        status: "available",
        $or: [
          { isAuction: false },
          { isAuction: { $exists: false } },
        ],
      };

      if (categoryId) filter.category = categoryId;

      products = await Product.find(filter)
        .populate("category seller", "name storeName email")
        .sort({ createdAt: -1 });
    }
    // 🔹 If admin → show all products
    else if (token.role === "admin") {
      products = await Product.find()
        .populate("category seller", "name storeName email");
    }


    else {
      return new Response(JSON.stringify({ error: "Unauthorized role" }), { status: 403 });
    }
    return new Response(JSON.stringify(products), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

// ✅ POST: Add normal or auction product (Seller only)
export async function POST(req) {
  try {
     await connectDB();

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== "seller") {
      return new Response(JSON.stringify({ error: "Unauthorized: Sellers only" }), { status: 403 });
    }


    const body = await req.json();
    console.log("Request body:", body);

    const {
      name,
      description,
      pricePerKg,
      quantity,
      category,
      images,
      isAuction = false,
      auctionStart,
      auctionEnd,
    } = body;

    if (!name || !pricePerKg || !quantity || !category) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }


    // ✅ Create the product
    const product = await Product.create({
      name,
      description,
      pricePerKg,
      quantity,
      images,
      category,
      seller: token.id,
      isAuction,
      auctionStart: isAuction ? new Date(auctionStart) : null,
      auctionEnd: isAuction ? new Date(auctionEnd) : null,
      bids: [],
      highestBid: { buyer: null, amount: 0 },
    });

    console.log("Saved product:", product);

    return new Response(JSON.stringify({ message: "Product added", product }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
