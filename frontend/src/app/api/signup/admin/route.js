import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/admin/admin";
import { hashPassword } from "@/utils/hash";

export async function POST(req) {
  try {
    await connectDB();
    const { name, email, password } = await req.json();

    const exists = await Admin.findOne({ email });
    if (exists) return new Response(JSON.stringify({ error: "Admin already exists" }), { status: 400 });

    const hashed = await hashPassword(password);
    const admin = await Admin.create({ name, email, password: hashed });

    return new Response(JSON.stringify({ message: "Admin created", admin }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
