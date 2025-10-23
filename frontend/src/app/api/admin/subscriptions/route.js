// app/api/admin/subscriptions/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/db";
import Subscription from "@/models/subscription/subscription";

export async function GET() {
  await connectDB();

  try {
    // Aggregate active subscriptions by userType
    const subsByType = await Subscription.aggregate([
      { $match: { status: "active" } },
      {
        $group: {
          _id: "$userType",
          totalCount: { $sum: 1 },
          totalRevenue: { $sum: "$amount" },
        },
      },
    ]);

    let sellerSubs = 0,
      buyerSubs = 0,
      sellerRevenue = 0,
      buyerRevenue = 0;

    subsByType.forEach((entry) => {
      if (entry._id === "Seller") {
        sellerSubs = entry.totalCount;
        sellerRevenue = entry.totalRevenue;
      } else if (entry._id === "Buyer") {
        buyerSubs = entry.totalCount;
        buyerRevenue = entry.totalRevenue;
      }
    });

    const totalSubscriptions = sellerSubs + buyerSubs;
    const totalRevenue = sellerRevenue + buyerRevenue;

    // Daily subscription revenue for chart
    const dailySubs = await Subscription.aggregate([
      { $match: { status: "active" } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
            userType: "$userType",
          },
          totalAmount: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    // Current month revenue
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const monthRevenueAgg = await Subscription.aggregate([
      {
        $match: {
          status: "active",
          createdAt: { $gte: monthStart, $lt: nextMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const monthRevenue = monthRevenueAgg[0]?.total || 0;

    // ✅ Return all stats
    return NextResponse.json({
      sellerSubs,
      buyerSubs,
      sellerRevenue,
      buyerRevenue,
      totalSubscriptions,
      totalRevenue,
      monthRevenue,
      dailySubs,
    });
  } catch (err) {
    console.error("Subscriptions Stats Error:", err);
    return NextResponse.json(
      { error: "Failed to load subscription stats" },
      { status: 500 }
    );
  }
}
