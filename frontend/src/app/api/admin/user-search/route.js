import connectDB from "@/lib/db/db";
import Seller from "@/models/user/seller";
import Buyer from "@/models/buyer/buyer";
import Subscription from "@/models/subscription/subscription";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== "admin")
      return NextResponse.json({ error: "Unauthorized: Admins only" }, { status: 403 });

    await connectDB();
    const { code } = await req.json();
    if (!code) return NextResponse.json({ error: "Code is required" }, { status: 400 });

    // Determine user type from code prefix
    let user, userType;
    if (code.includes("-S-")) {
      userType = "Seller";
      user = await Seller.findOne({ sellerCode: code }).lean();
    } else if (code.includes("-B-")) {
      userType = "Buyer";
      user = await Buyer.findOne({ buyerCode: code }).lean();
    } else {
      return NextResponse.json({ error: "Invalid code format" }, { status: 400 });
    }

    if (!user)
      return NextResponse.json({ error: `${userType} not found` }, { status: 404 });

    // Get latest subscription if any
    const subscription = await Subscription.findOne({
      userId: user._id,
      userType,
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      userType,
      user,
      subscription: subscription || null,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// 🟢 PATCH - suspend/unsuspend
export async function PATCH(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== "admin")
      return NextResponse.json({ error: "Unauthorized: Admins only" }, { status: 403 });

    await connectDB();
    const { code, action } = await req.json();
    if (!code || !["suspend", "unsuspend"].includes(action))
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });

    let user, Model, userType;
    if (code.includes("-S-")) {
      Model = Seller;
      userType = "Seller";
      user = await Model.findOneAndUpdate(
        { sellerCode: code },
        { isSuspended: action === "suspend" },
        { new: true }
      );
    } else if (code.includes("-B-")) {
      Model = Buyer;
      userType = "Buyer";
      user = await Model.findOneAndUpdate(
        { buyerCode: code },
        { isSuspended: action === "suspend" },
        { new: true }
      );
    } else {
      return NextResponse.json({ error: "Invalid code format" }, { status: 400 });
    }

    if (!user)
      return NextResponse.json({ error: `${userType} not found` }, { status: 404 });

    return NextResponse.json({
      message: `User ${action === "suspend" ? "suspended" : "unsuspended"} successfully`,
      user,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
