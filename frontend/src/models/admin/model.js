// src/models/model.jsx
import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }, // hashed
  role: { type: String, enum: ["admin"], default: "admin" },
});

export default mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
