import { NextResponse } from "next/server";
import connectDB from "@/lib/db/db";
import Coupon from "@/models/coupon/coupon";

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) return NextResponse.json({ error: "No coupon code provided" }, { status: 400 });

  const coupon = await Coupon.findOne({ code: code.toUpperCase().trim(), isActive: true });
  if (!coupon) return NextResponse.json({ error: "Invalid or expired coupon" }, { status: 404 });

  return NextResponse.json({ coupon });
}
