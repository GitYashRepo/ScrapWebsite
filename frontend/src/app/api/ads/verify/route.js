import crypto from "crypto";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/db";
import Ad from "@/models/ad/ad";

export async function POST(req) {
  await connectDB();

  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    const sign = crypto
      .createHmac("sha256", process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (sign !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const ad = await Ad.findOne({ orderId: razorpay_order_id });
    if (!ad) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }

    // Calculate start and end times
    const adStart = new Date();
    const adEnd = new Date(adStart.getTime() + ad.durationHours * 60 * 60 * 1000);

    ad.paymentId = razorpay_payment_id;
    ad.paymentStatus = "paid";
    ad.adStart = adStart;
    ad.adEnd = adEnd;
    ad.status = "running";
    await ad.save();

    return NextResponse.json({ message: "Ad payment verified", ad });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
