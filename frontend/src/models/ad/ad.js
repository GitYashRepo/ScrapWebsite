import mongoose from "mongoose";

const AdSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    companyEmail: { type: String, required: true },
    companyWebsite: { type: String },
    contactNumber: { type: String },

    title: { type: String, required: true },
    description: { type: String, required: true },

    productImages: [{ type: String }], // Uploaded ad images
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    offerDetails: { type: String },

    durationHours: { type: Number, required: true }, // Ad run time
    costPerHour: { type: Number, default: 50 }, // Change as needed
    totalAmount: { type: Number }, // Calculated before payment

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    orderId: { type: String },
    paymentId: { type: String },

    adStart: { type: Date },
    adEnd: { type: Date },

    status: {
      type: String,
      enum: ["scheduled", "running", "expired"],
      default: "scheduled",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Ad || mongoose.model("Ad", AdSchema);
