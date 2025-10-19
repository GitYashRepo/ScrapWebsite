import { NextResponse } from "next/server";
import razorpay from "@/lib/razorpay";
import Subscription from "@/models/subscription/subscription";
import connectDB from "@/lib/db/db";

export async function POST(req) {
  await connectDB();
  try {
    const body = await req.json();
    const { userId, userType, planName } = body;

    const plans = {
      seller_monthly: 2500,
      seller_quarterly: 7000,
      seller_halfyear: 13500,
      seller_yearly: 25000,
      buyer_monthly: 500,
      buyer_quarterly: 1350,
      buyer_halfyear: 2750,
      buyer_yearly: 5500,
    };

    if (!plans[planName]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const order = await razorpay.orders.create({
      amount: plans[planName] * 100, // in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: { planName, userType },
    });

    const subscription = await Subscription.create({
      userId,
      userType,
      planName,
      amount: plans[planName],
      orderId: order.id,
    });

    return NextResponse.json({ order, subscription });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
