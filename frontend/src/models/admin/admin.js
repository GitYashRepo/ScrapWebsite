// src/models/model.jsx
import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin"], default: "admin" },
}, { timestamps: true });

export default mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
