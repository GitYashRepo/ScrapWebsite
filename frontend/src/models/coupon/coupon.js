import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },
  type: {
    type: String,
    enum: ["seller_discount", "seller_free_3months"],
    required: true,
  },
  discountPercentage: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true, // 🔹 easy to deactivate a coupon later without deleting
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);
