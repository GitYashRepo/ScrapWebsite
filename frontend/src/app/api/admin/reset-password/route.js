import connectDB from "@/lib/db/db";
import Buyer from "@/models/buyer/buyer";
import Seller from "@/models/user/seller";
import { hashPassword } from "@/utils/hash";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(req) {
  await connectDB();
  const session = await getServerSession(authOptions);

  // ✅ Ensure only admin can access
  if (!session || session.user.role !== "admin") {
    return new Response(
      JSON.stringify({ error: "Unauthorized — admin only." }),
      { status: 403 }
    );
  }

  const { email, newPassword } = await req.json();

  if (!email || !newPassword) {
    return new Response(
      JSON.stringify({ error: "Email and new password are required." }),
      { status: 400 }
    );
  }

  const user = (await Buyer.findOne({ email })) || (await Seller.findOne({ email }));

  if (!user) {
    return new Response(JSON.stringify({ error: "User not found." }), {
      status: 404,
    });
  }

  const hashedPassword = await hashPassword(newPassword);
  user.password = hashedPassword;
  user.markModified("password");
  await user.save();

  return new Response(
    JSON.stringify({ message: `Password for ${user.email} has been successfully reset.`}),
    { status: 200 }
  );
}
