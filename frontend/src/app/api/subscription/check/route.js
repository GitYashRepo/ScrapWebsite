import { NextResponse } from "next/server";
import connectDB from "@/lib/db/db";
import Subscription from "@/models/subscription/subscription";
import mongoose from "mongoose";

export async function POST(req) {
  await connectDB();

  try {
    const { userId, userType } = await req.json();

    if (!userId) {
      return NextResponse.json({ active: false, message: "Missing userId" });
    }

    // 🕓 Step 1: Expire outdated subscriptions automatically
    await Subscription.updateMany(
      { status: "active", endDate: { $lt: new Date() } },
      { status: "expired" }
    );

    const subscription = await Subscription.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      userType,
      status: "active",
      endDate: { $gte: new Date() },
    });

    if (!subscription) {
      return NextResponse.json({ active: false });
    }

    return NextResponse.json({ active: true, subscription });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
