import connectDB from "@/lib/db/db";
import Buyer from "@/models/buyer/buyer";
import { hashPassword } from "@/utils/hash";

export async function POST(req) {
  try {
    await connectDB();
    const { name, email, address, city, pinCode, phone, password } = await req.json();

    const exists = await Buyer.findOne({ email });
    if (exists) return new Response(JSON.stringify({ error: "Buyer already exists" }), { status: 400 });

    const year = new Date().getFullYear();

    // Find the last buyer (latest created)
    const lastBuyer = await Buyer.findOne({ buyerCode: new RegExp(`^${year}-B-`) }).sort({ createdAt: -1 }).lean();

    let baseNumber = 50000;
    let nextNumber = baseNumber;
    if (lastBuyer?.buyerCode) {
      const parts = lastBuyer.buyerCode.split("-");
      const lastNum = parseInt(parts[2]);
      if (!isNaN(lastNum)) nextNumber = lastNum + 1;
    }

    // ✅ Always generate a valid code, even if no buyers exist
    const buyerCode = `${year}-B-${nextNumber}`;
    console.log("✅ Generated buyerCode:", buyerCode);

    const hashed = await hashPassword(password);
    const buyer = await Buyer.create({ name, email, buyerCode, address, city, pinCode, phone, password: hashed });

    return new Response(JSON.stringify({ message: "Buyer created", buyer }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
