// models/chat/ChatSession.js
import mongoose from "mongoose";

const ChatSessionSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "Buyer", required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    createdAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
    },
  },
  { timestamps: true }
);

ChatSessionSchema.index({ buyer: 1, seller: 1, product: 1 }, { unique: true }); // ensures no duplicate sessions

export default mongoose.models.ChatSession ||
  mongoose.model("ChatSession", ChatSessionSchema);
