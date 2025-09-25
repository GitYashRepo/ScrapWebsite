import mongoose from "mongoose";

const quoteSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    company: String,
    projectType: String,
    budget: String,
    timeline: String,
    description: { type: String, required: true },
    selectedServices: [String],
    status: {
      type: String,
      enum: [
        "Contacted",
        "Interested",
        "Advance Paid",
        "Working",
        "Call Rejected",
        "Didn’t Receive Call",
      ],
      default: "Interested",
    },
    read: {
        type: String,
        enum: [
            "Read",
            "Unread",
        ],
        default: "Unread",
    },
    amountPaid: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Quote", quoteSchema);
