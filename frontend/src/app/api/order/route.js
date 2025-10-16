import connectDB from "@/lib/db/db";
import Order from "@/models/order/order";
import Product from "@/models/product/product";
import { getToken } from "next-auth/jwt";

export async function POST(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== "buyer")
      return new Response(JSON.stringify({ error: "Unauthorized: Buyers only" }), { status: 403 });

    await connectDB();
    const { items, paymentMethod, shippingAddress } = await req.json();

    if (!items || items.length === 0)
      return new Response(JSON.stringify({ error: "No items provided" }), { status: 400 });

    let totalAmount = 0;
    let sellerId = null;

    // Get product details
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) throw new Error("Product not found");
      if (product.quantity < item.quantity)
        throw new Error(`Not enough stock for ${product.name}`);

      totalAmount += product.price * item.quantity;
      sellerId = product.seller;

      // update product stock and soldCount
      product.quantity -= item.quantity;
      product.soldCount += item.quantity;
      await product.save();
    }

    const order = await Order.create({
      buyer: token.id,
      seller: sellerId,
      items: items.map((i) => ({
        product: i.product,
        quantity: i.quantity,
        priceAtPurchase: i.price,
      })),
      totalAmount,
      paymentMethod,
      shippingAddress,
    });

    return new Response(JSON.stringify({ message: "Order placed", order }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
