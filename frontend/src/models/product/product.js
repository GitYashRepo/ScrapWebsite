// src/models/product.js
import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    pricePerKg: { type: Number, required: true },
    quantity: { type: Number, required: true },
    images: [{ type: String }],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
    soldCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["available", "out-of-stock", "discontinued"],
      default: "available",
    },
    isAuction: { type: Boolean, default: false },
    auctionStart: { type: Date },
    auctionEnd: { type: Date },
    bids: [
      {
        buyer: { type: mongoose.Schema.Types.ObjectId, ref: "Buyer" },
        amount: { type: Number, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    highestBid: {
      buyer: { type: mongoose.Schema.Types.ObjectId, ref: "Buyer" },
      amount: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
