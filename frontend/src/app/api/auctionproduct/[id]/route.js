import connectDB from "@/lib/db/db";
import Product from "@/models/product/product";
import { getToken } from "next-auth/jwt";

// ✅ GET — fetch single auction product (for edit page)
export async function GET(req, { params }) {
  try {
    await connectDB();

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== "seller") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
    }

    const { id } = params;
    const product = await Product.findOne({
      _id: id,
      seller: token.id,
      isAuction: true,
    })
      .populate("category")
      .populate("seller");

    if (!product) {
      return new Response(JSON.stringify({ error: "Auction product not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(product), { status: 200 });
  } catch (error) {
    console.error("Error fetching auction product:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

// ✅ PATCH — seller updates auction product
export async function PATCH(req, { params }) {
  try {
    await connectDB();

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== "seller") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
    }

    const { id } = params;
    const body = await req.json();

    // Only allow editable fields
    const updateFields = {};
    if (body.name) updateFields.name = body.name;
    if (body.description) updateFields.description = body.description;
    if (body.pricePerKg) updateFields.pricePerKg = body.pricePerKg;
    if (body.quantity) updateFields.quantity = body.quantity;
    if (body.status) updateFields.status = body.status;
    if (body.auctionStart) updateFields.auctionStart = body.auctionStart;
    if (body.auctionEnd) updateFields.auctionEnd = body.auctionEnd;

    const product = await Product.findOneAndUpdate(
      { _id: id, seller: token.id, isAuction: true },
      updateFields,
      { new: true }
    );

    if (!product) {
      return new Response(
        JSON.stringify({ error: "Auction product not found or unauthorized" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ message: "Auction product updated successfully", product }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating auction product:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

// ✅ DELETE — seller deletes auction product
export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== "seller") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
    }

    const { id } = params;

    const product = await Product.findOneAndDelete({
      _id: id,
      seller: token.id,
      isAuction: true,
    });

    if (!product) {
      return new Response(
        JSON.stringify({ error: "Auction product not found or unauthorized" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ message: "Auction product deleted successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting auction product:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
