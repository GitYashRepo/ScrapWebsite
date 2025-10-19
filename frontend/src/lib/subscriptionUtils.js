import Subscription from "@/models/subscription/subscription";

export async function autoExpireSubscriptions() {
  const now = new Date();

  // Set expired where endDate < now
  await Subscription.updateMany(
    {
      status: "active",
      endDate: { $lt: now },
    },
    { status: "expired" }
  );
}
