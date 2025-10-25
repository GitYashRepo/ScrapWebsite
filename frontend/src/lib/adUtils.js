import Ad from "@/models/ad/ad";

export async function autoExpireAds() {
  const now = new Date();
  await Ad.updateMany(
    { status: "running", adEnd: { $lt: now } },
    { status: "expired" }
  );
}
