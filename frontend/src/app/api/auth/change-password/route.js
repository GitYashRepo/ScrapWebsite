import connectDB from "@/lib/db/db";
import Buyer from "@/models/buyer/buyer";
import Seller from "@/models/user/seller";
import { compare } from "bcryptjs";
import { hashPassword } from "@/utils/hash";
import { getServerSession } from "next-auth";

export async function POST(req) {
  await connectDB();
  const session = await getServerSession();

  if (!session || !session.user?.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { currentPassword, newPassword } = await req.json();
  const email = session.user.email;

  // find in both Buyer & Seller
  const user =
    (await Buyer.findOne({ email })) || (await Seller.findOne({ email }));

  if (!user)
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
    });

  // verify old password
  const isValid = await compare(currentPassword, user.password);
  if (!isValid)
    return new Response(JSON.stringify({ error: "Incorrect current password" }), {
      status: 400,
    });

  // hash new password
  const hashed = await hashPassword(newPassword);
  user.password = hashed;
  user.markModified("password");
  await user.save();

  return new Response(
    JSON.stringify({ message: "Password updated successfully" }),
    { status: 200 }
  );
}
