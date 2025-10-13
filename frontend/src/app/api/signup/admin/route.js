import connectDB from "@/lib/db/db";
import Admin from "@/models/admin/admin";
import { hashPassword } from "@/utils/hash";

export async function POST() {
  try {
    await connectDB();

    // ✅ Hardcoded one-time admin credentials
    const adminEmail = "webtechware25@gmail.com";
    const adminPassword = "9201043";
    const adminName = "Yash Singh";

    // ✅ Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (existingAdmin) {
      return new Response(JSON.stringify({ message: "Admin already exists" }), { status: 400 });
    }

    const hashed = await hashPassword(adminPassword);
    const admin = await Admin.create({
      name: adminName,
      email: adminEmail,
      password: hashed,
      role: "admin",
    });

    return new Response(JSON.stringify({ message: "✅ Admin created successfully", admin }), {
      status: 201,
    });
  } catch (err) {
    return new Response(JSON.stringify({ message: err.message }), { status: 500 });
  }
}
