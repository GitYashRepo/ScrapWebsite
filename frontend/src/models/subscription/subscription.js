import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "userType", // can reference Seller or Buyer
    },
    userType: {
      type: String,
      required: true,
      enum: ["Seller", "Buyer"],
    },
    planName: {
      type: String,
      required: true,
      enum: [
        "seller_monthly",
        "seller_quarterly",
        "seller_halfyear",
        "seller_yearly",
        "buyer_monthly",
        "buyer_quarterly",
        "buyer_halfyear",
        "buyer_yearly",
      ],
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    paymentId: { type: String },
    orderId: { type: String },
    status: {
      type: String,
      enum: ["pending", "active", "expired", "failed"],
      default: "pending",
    },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Subscription ||
  mongoose.model("Subscription", SubscriptionSchema);
