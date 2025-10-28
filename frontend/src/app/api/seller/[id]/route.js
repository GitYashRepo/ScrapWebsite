import connectDB from "@/lib/db/db";
import Seller from "@/models/user/seller";

export async function GET(req, context) {
   const { params } = await context;
  try {
    await connectDB();
    const seller = await Seller.findById(params.id).lean();

    if (!seller) {
      return new Response(
        JSON.stringify({ error: "Seller not found" }),
        { status: 404 }
      );
    }

    return new Response(JSON.stringify(seller), { status: 200 });
  } catch (error) {
    console.error("Error fetching seller:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
