// import { NextResponse } from "next/server";
// import connectDB from "@/lib/dbConnect";
// import Seller from "@/models/Seller";

// export async function POST(req) {
//   try {
//     const body = await req.json();
//     const { sellerId, subscription } = body;
//     await connectDB();

//     await Seller.findByIdAndUpdate(sellerId, {
//       pushSubscription: subscription,
//     });

//     return NextResponse.json({ success: true });
//   } catch (err) {
//     console.error("Subscription save error:", err);
//     return NextResponse.json({ success: false, error: "Failed to save subscription" });
//   }
// }


import webpush from "web-push";
import Seller from "@/models/user/seller";
import connectDB from "@/lib/db/db";

webpush.setVapidDetails(
  "mailto:kabaadmandi@gmail.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export async function POST(req) {
  try {
    const { sellerId, message } = await req.json();
    await connectDB();

    const seller = await Seller.findById(sellerId);
    if (!seller || !seller.pushSubscription)
      return Response.json({ success: false, message: "No subscription" });

    await webpush.sendNotification(
      seller.pushSubscription,
      JSON.stringify({
        title: "💬 New Message on Kabaad Mandi",
        body: message,
      })
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error("Push error:", error);
    return Response.json({ success: false, error: error.message });
  }
}
