import mongoose from "mongoose";

const SellerSchema = new mongoose.Schema({
  storeName: { type: String, required: true },
  ownerName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: {type: String, required: true},
  city: {type: String, required: true},
  state: {type: String, required: true},
  pinCode: {type: Number, required: true},
  phone: {type: Number, required: true},
});

export default mongoose.models.Seller || mongoose.model("Seller", SellerSchema);
