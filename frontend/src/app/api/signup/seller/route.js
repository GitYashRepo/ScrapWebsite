import connectDB from "@/lib/db/db";
import Seller from "@/models/user/seller";
import { hashPassword } from "@/utils/hash";

export async function POST(req) {
  try {
    await connectDB();
    const { storeName, ownerName, email, password, address, city, state, pinCode, phone } = await req.json();

    const exists = await Seller.findOne({ email });
    if (exists) return new Response(JSON.stringify({ error: "Seller already exists" }), { status: 400 });

    const hashed = await hashPassword(password);
    const seller = await Seller.create({ storeName, ownerName, email, password: hashed, address, city, state, pinCode, phone });

    return new Response(JSON.stringify({ message: "Seller created", seller }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
