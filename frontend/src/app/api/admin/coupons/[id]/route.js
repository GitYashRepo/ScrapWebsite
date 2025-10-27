import { NextResponse } from "next/server";
import connectDB from "@/lib/db/db";
import Coupon from "@/models/coupon/coupon";

export async function DELETE(req, { params }) {
  await connectDB();
  try {
    const { id } = params;
    await Coupon.findByIdAndDelete(id);
    return NextResponse.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 });
  }
}
