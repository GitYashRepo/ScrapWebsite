import { connectDB } from "@/lib/mongodb";
import Buyer from "@/models/buyer/buyer";
import { hashPassword } from "@/utils/hash";

export async function POST(req) {
  try {
    await connectDB();
    const { name, email, companyName, gst, address, city, state, pinCode, phone, password } = await req.json();

    const exists = await Buyer.findOne({ email });
    if (exists) return new Response(JSON.stringify({ error: "Buyer already exists" }), { status: 400 });

    const hashed = await hashPassword(password);
    const buyer = await Buyer.create({ name, email, companyName, gst, address, city, state, pinCode, phone, password: hashed });

    return new Response(JSON.stringify({ message: "Buyer created", buyer }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
