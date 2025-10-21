import mongoose, { Schema } from "mongoose";

const BuyerSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  address: {type: String, required: true},
  city: {type: String, required: true},
  pinCode: {type: Number, required: true},
  phone: {type: Number, required: true},
  password: { type: String, required: true },
});

export default mongoose.models.Buyer || mongoose.model("Buyer", BuyerSchema);
