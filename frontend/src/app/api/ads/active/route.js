import { NextResponse } from "next/server";
import connectDB from "@/lib/db/db";
import Ad from "@/models/ad/ad";

export async function GET() {
  await connectDB();

  try {
    const now = new Date();

    // Fetch only ads that are paid and currently running
    const activeAds = await Ad.find({
      paymentStatus: "paid",
      status: "running",
      adStart: { $lte: now },
      adEnd: { $gte: now },
    }).sort({ createdAt: -1 });

    return NextResponse.json(activeAds);
  } catch (err) {
    console.error("Error fetching ads:", err);
    return NextResponse.json({ error: "Failed to fetch ads" }, { status: 500 });
  }
}
