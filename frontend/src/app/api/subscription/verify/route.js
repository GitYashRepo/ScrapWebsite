import crypto from "crypto";
import { NextResponse } from "next/server";
import Subscription from "@/models/subscription/subscription";
import connectDB from "@/lib/db/db";

export async function POST(req) {
  await connectDB();
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    const sign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (sign !== razorpay_signature)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });

    const subscription = await Subscription.findOneAndUpdate(
      { orderId: razorpay_order_id },
      {
        status: "active",
        paymentId: razorpay_payment_id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // default 1 month validity
      },
      { new: true }
    );

    return NextResponse.json({ message: "Payment verified", subscription });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
