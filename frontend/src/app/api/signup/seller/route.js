import connectDB from "@/lib/db/db";
import Seller from "@/models/user/seller";
import { hashPassword } from "@/utils/hash";

export async function POST(req) {
  try {
    await connectDB();
    const { storeName, ownerName, email, password, address, city, state, pinCode, phone } = await req.json();

    const exists = await Seller.findOne({ email });
    if (exists) return new Response(JSON.stringify({ error: "Seller already exists" }), { status: 400 });

    const year = new Date().getFullYear();

    const lastSeller = await Seller.findOne({ sellerCode: new RegExp(`^${year}-S-`) }).sort({ createdAt: -1 }).lean();

    let baseNumber = 50000;
    let nextNumber = baseNumber;
    if (lastSeller?.sellerCode) {
         const parts = lastSeller.sellerCode.split("-");
         const lastNum = parseInt(parts[2]);
         if (!isNaN(lastNum)) nextNumber = lastNum + 1;
    }

    // ✅ Always generate a valid code, even if no sellers exist
    const sellerCode = `${year}-S-${nextNumber}`;

    const hashed = await hashPassword(password);
    const seller = await Seller.create({ storeName, ownerName, email, sellerCode, password: hashed, address, city, state, pinCode, phone });

    return new Response(JSON.stringify({ message: "Seller created", seller }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
