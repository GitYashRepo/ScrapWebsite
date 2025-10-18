// models/chat/Message.js
import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    session: { type: mongoose.Schema.Types.ObjectId, ref: "ChatSession", required: true },
    senderModel: { type: String, enum: ["Buyer", "Seller"], required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Message ||
  mongoose.model("Message", MessageSchema);
