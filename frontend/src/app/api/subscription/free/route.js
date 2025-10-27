import { NextResponse } from "next/server";
import connectDB from "@/lib/db/db";
import Subscription from "@/models/subscription/subscription";

export async function POST(req) {
  await connectDB();
  const { userId, userType, planName, couponCode } = await req.json();

  if (!userId || !userType || !couponCode)
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

  const start = new Date();
  const end = new Date();
  end.setMonth(end.getMonth() + 3);

  const subscription = await Subscription.create({
    userId,
    userType,
    planName,
    couponCode,
    status: "active",
    startDate: start,
    endDate: end,
    amount: 0,
  });

  return NextResponse.json({ message: "Free subscription activated", subscription });
}
