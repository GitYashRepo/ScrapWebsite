import connectDB from "@/lib/db/db";
import Seller from "@/models/user/seller";
import Buyer from "@/models/buyer/buyer";
import { getToken } from "next-auth/jwt";

export async function GET(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== "admin")
      return new Response(JSON.stringify({ error: "Unauthorized: Admins only" }), { status: 403 });

    await connectDB();
    const sellers = await Seller.find();
    const buyers = await Buyer.find();

    return new Response(JSON.stringify({ sellers, buyers }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}


// export async function PATCH(req) {
//   try {
//     const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
//     if (!token || token.role !== "admin")
//       return new Response(JSON.stringify({ error: "Unauthorized: Admins only" }), { status: 403 });

//     await connectDB();
//     const { userId, userType, action } = await req.json();

//     if (!userId || !userType || !["suspend", "unsuspend"].includes(action)) {
//       return new Response(JSON.stringify({ error: "Invalid request data" }), { status: 400 });
//     }

//     const Model = userType === "Seller" ? Seller : Buyer;
//     const updatedUser = await Model.findByIdAndUpdate(
//       userId,
//       { isSuspended: action === "suspend" },
//       { new: true }
//     );

//     if (!updatedUser) {
//       return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
//     }

//     return new Response(
//       JSON.stringify({
//         message: `User ${action === "suspend" ? "suspended" : "unsuspended"} successfully.`,
//         user: updatedUser,
//       }),
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Error updating suspension:", error);
//     return new Response(JSON.stringify({ error: error.message }), { status: 500 });
//   }
// }
