import connectDB from "@/lib/db/db";
import Buyer from "@/models/buyer/buyer";

export async function GET(req, context) {
   const { params } = await context;
  try {
    await connectDB();
    const { email } = await params;
    const buyer = await Buyer.findOne({ email }).lean();

    if (!buyer) {
      return new Response(JSON.stringify({ message: "Buyer not found" }), { status: 404 });
    }

    return new Response(JSON.stringify(buyer), { status: 200 });
  } catch (error) {
    console.error("Error fetching buyer:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
}
