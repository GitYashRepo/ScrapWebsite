import connectDB from "@/lib/db/db";
import Buyer from "@/models/buyer/buyer";
import Seller from "@/models/user/seller";
import Subscription from "@/models/subscription/subscription";

export async function GET() {
  await connectDB();

  // Fetch buyers & sellers
  const buyers = await Buyer.find().lean();
  const sellers = await Seller.find().lean();

  // Fetch all active subscriptions
  const subscriptions = await Subscription.find({ status: "active" }).lean();

  // Attach subscription to matching user
  const buyersWithSub = buyers.map((b) => {
    const sub = subscriptions.find(
      (s) =>
        s.userType === "Buyer" && String(s.userId) === String(b._id)
    );
    return { ...b, subscription: sub || null };
  });

  const sellersWithSub = sellers.map((s) => {
    const sub = subscriptions.find(
      (s2) =>
        s2.userType === "Seller" && String(s2.userId) === String(s._id)
    );
    return { ...s, subscription: sub || null };
  });

  return new Response(
    JSON.stringify({
      buyers: buyersWithSub,
      sellers: sellersWithSub,
    }),
    { status: 200 }
  );
}
