import { NextResponse } from "next/server";
import connectDB from "@/lib/db/db";
import Subscription from "@/models/subscription/subscription";

export async function POST(req) {
  await connectDB();

  try {
    const { userId } = await req.json();

    const subscription = await Subscription.findOne({
      userId,
      userType: "Seller",
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
