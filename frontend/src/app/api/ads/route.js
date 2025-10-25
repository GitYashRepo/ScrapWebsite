import { NextResponse } from "next/server";
import connectDB from "@/lib/db/db";
import razorpay from "@/lib/razorpay";
import Ad from "@/models/ad/ad";

export async function POST(req) {
  await connectDB();

  try {
    const body = await req.json();
    const {
      companyName,
      companyEmail,
      companyWebsite,
      contactNumber,
      title,
      description,
      productImages,
      price,
      discountPrice,
      offerDetails,
      durationHours,
      costPerHour = 50,
    } = body;

    if (!companyName || !title || !durationHours) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const totalAmount = costPerHour * durationHours;

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: totalAmount * 100, // in paise
      currency: "INR",
      receipt: `ad_${Date.now()}`,
      notes: { companyName, title },
    });

    // Save ad with "pending" payment
    const ad = await Ad.create({
      companyName,
      companyEmail,
      companyWebsite,
      contactNumber,
      title,
      description,
      productImages,
      price,
      discountPrice,
      offerDetails,
      durationHours,
      costPerHour,
      totalAmount,
      orderId: order.id,
    });

    return NextResponse.json({ order, ad });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong while creating ad" },
      { status: 500 }
    );
  }
}
