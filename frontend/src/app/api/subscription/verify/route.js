import crypto from "crypto";
import { NextResponse } from "next/server";
import Subscription from "@/models/subscription/subscription";
import connectDB from "@/lib/db/db";

export async function POST(req) {
  await connectDB();
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, couponCode } = body;

    const sign = crypto
      .createHmac("sha256", process.env.RAZORPAY_LIVE_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (sign !== razorpay_signature)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });

    // 🔍 Find subscription by orderId
    const subscription = await Subscription.findOne({ orderId: razorpay_order_id });
    if (!subscription)
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });

    // 🕓 Calculate start and end dates based on plan duration (month-accurate)
    const startDate = new Date();
    const endDate = new Date(startDate);

    if (subscription.planName.includes("quarterly")) {
      endDate.setMonth(endDate.getMonth() + 3);
    } else if (subscription.planName.includes("halfyear")) {
      endDate.setMonth(endDate.getMonth() + 6);
    } else if (subscription.planName.includes("yearly")) {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // ✅ Mark subscription active
    subscription.status = "active";
    subscription.paymentId = razorpay_payment_id;
    subscription.startDate = startDate;
    subscription.endDate = endDate;
    if (couponCode) subscription.couponCode = couponCode;
    await subscription.save();

    return NextResponse.json({ message: "Payment verified", subscription });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
