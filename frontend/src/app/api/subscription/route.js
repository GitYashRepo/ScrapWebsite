import { NextResponse } from "next/server";
import razorpay from "@/lib/razorpay";
import Subscription from "@/models/subscription/subscription";
import Coupon from "@/models/coupon/coupon";
import connectDB from "@/lib/db/db";

export async function POST(req) {
  await connectDB();
  try {
    const body = await req.json();
    const { userId, userType, planName, couponCode } = body;

    const plans = {
      seller_monthly: 2500,
      seller_quarterly: 5000,
      seller_halfyear: 10000,
      seller_yearly: 15000,
      buyer_monthly: 500,
      buyer_quarterly: 1300,
      buyer_halfyear: 2500,
      buyer_yearly: 5000,
    };

    if (!plans[planName]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // ✅ Check for any active subscription
    const existingActive = await Subscription.findOne({
      userId,
      userType,
      status: "active",
      endDate: { $gte: new Date() },
    });

    if (existingActive) {
      return NextResponse.json(
        {
          error: "You already have an active subscription",
          active: true,
          subscription: existingActive,
        },
        { status: 400 }
      );
    }

    // ✅ Start with base amount
    let finalAmount = plans[planName];
    let couponUsed = null;

    // ✅ Apply coupon (if provided)
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode });
      if (!coupon) {
        return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 });
      }

      // 🚫 Prevent re-use by the same seller
      const alreadyUsed = await Subscription.findOne({
        userId,
        userType,
        couponCode: { $ne: null },
        $or: [{ couponCode: couponCode }, { couponCode: { $regex: /^FREE/i } }],
      });

      if (alreadyUsed) {
        return NextResponse.json(
          { error: "You have already used this coupon before" },
          { status: 400 }
        );
      }

      // ✅ Apply discount logic
      if (coupon.type === "seller_discount" && userType === "Seller") {
        finalAmount = finalAmount - (finalAmount * coupon.discountPercentage) / 100;
        couponUsed = coupon.code;
      } else if (coupon.type === "seller_free_3months" && userType === "Seller") {
        finalAmount = 0;
        couponUsed = coupon.code;
      }
    }

    // ✅ Calculate plan duration
    const planDurations = {
      seller_monthly: 1,
      seller_quarterly: 3,
      seller_halfyear: 6,
      seller_yearly: 12,
      buyer_monthly: 1,
      buyer_quarterly: 3,
      buyer_halfyear: 6,
      buyer_yearly: 12,
    };

    const monthsToAdd = planDurations[planName];
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + monthsToAdd);

    // 🧾 Razorpay order creation
    let order = null;
    if (finalAmount > 0) {
      order = await razorpay.orders.create({
        amount: finalAmount * 100,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        notes: { planName, userType },
      });
    }

    // ✅ Save subscription
    const subscription = await Subscription.create({
      userId,
      userType,
      planName,
      amount: finalAmount,
      couponCode: couponUsed, // <— store which coupon was used
      orderId: order ? order.id : `FREE_${Date.now()}`,
      status: finalAmount === 0 ? "active" : "pending",
      startDate: finalAmount === 0 ? startDate : null,
      endDate: finalAmount === 0 ? endDate : null,
    });

    return NextResponse.json({ order, subscription });
  } catch (error) {
    console.error("Subscription creation error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
