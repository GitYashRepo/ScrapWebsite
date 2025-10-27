import { NextResponse } from "next/server";
import connectDB from "@/lib/db/db";
import Coupon from "@/models/coupon/coupon";

// ✅ Create a new coupon
export async function POST(req) {
  await connectDB();
  try {
    const { code, type, discountPercentage } = await req.json();

    if (!code || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await Coupon.findOne({ code });
    if (existing) {
      return NextResponse.json({ error: "Coupon already exists" }, { status: 400 });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase().trim(),
      type,
      discountPercentage: type === "seller_discount" ? discountPercentage : 0,
    });

    return NextResponse.json({ message: "Coupon created successfully", coupon });
  } catch (error) {
    console.error("Error creating coupon:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ✅ Get all coupons (for admin dashboard)
export async function GET() {
  await connectDB();
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return NextResponse.json({ coupons });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}
