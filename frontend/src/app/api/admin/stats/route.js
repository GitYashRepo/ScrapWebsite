// app/api/admin/stats/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/db";
import Seller from "@/models/user/seller";
import Buyer from "@/models/buyer/buyer";
import Subscription from "@/models/subscription/subscription";

export async function GET() {
  await connectDB();

  try {
    const sellerCount = await Seller.countDocuments();
    const buyerCount = await Buyer.countDocuments();
    const totalUsers = sellerCount + buyerCount;

    // Daily signups
    const [dailySellers, dailyBuyers] = await Promise.all([
      Seller.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      ]),
      Buyer.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      ]),
    ]);

    // Subscription totals & revenue
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

    return NextResponse.json({
      sellerCount,
      buyerCount,
      totalUsers,
      totalSubscriptions,
      totalRevenue,
      sellerSubs,
      buyerSubs,
      sellerRevenue,
      buyerRevenue,
      dailySellers,
      dailyBuyers,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
