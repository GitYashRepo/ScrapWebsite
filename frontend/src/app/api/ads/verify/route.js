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
      .createHmac("sha256", process.env.RAZORPAY_LIVE_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (sign !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const ad = await Ad.findOne({ orderId: razorpay_order_id });
    if (!ad) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }

    const now = new Date();

    // Find the latest running or scheduled ad
    const latestAd = await Ad.findOne({
      status: { $in: ["running", "scheduled"] },
    }).sort({ adEnd: -1 });

    // Calculate ad start and end
    let adStart = now;
    if (latestAd && latestAd.adEnd > now) {
      adStart = latestAd.adEnd; // queue the new ad
    }
    const adEnd = new Date(adStart.getTime() + ad.durationHours * 60 * 60 * 1000);


    ad.paymentId = razorpay_payment_id;
    ad.paymentStatus = "paid";
    ad.adStart = adStart;
    ad.adEnd = adEnd;
    ad.status = adStart <= now ? "running" : "scheduled";
    await ad.save();

    // If queued, calculate waiting time in hours/minutes
    let willStartIn = null;
    if (ad.status === "scheduled") {
      const diffMs = adStart.getTime() - now.getTime();
      const diffMinutes = Math.round(diffMs / 60000);
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      willStartIn = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    }

    return NextResponse.json({
      message:
        ad.status === "running"
          ? "✅ Ad payment verified and now running!"
          : `🕓 Ad queued and will start in approximately ${willStartIn}.`,
      ad,
      willStartIn,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
