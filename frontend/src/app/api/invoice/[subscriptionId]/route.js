import { NextResponse } from "next/server";
import connectDB from "@/lib/db/db";
import Subscription from "@/models/subscription/subscription";
import Seller from "@/models/user/seller";
import Buyer from "@/models/buyer/buyer";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function GET(req, context) {
  await connectDB();
  const { subscriptionId } = await context.params;

  try {
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    const userModel = subscription.userType === "Seller" ? Seller : Buyer;
    const user = await userModel.findById(subscription.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 🧾 Generate PDF Invoice
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const { width, height } = page.getSize();

    const drawText = (text, x, y, size = 12, color = rgb(0, 0, 0)) =>
      page.drawText(text, { x, y, size, font, color });

    // 🔹 Header (Company Info)
    drawText("Kabaad Mandi", 50, height - 60, 22, rgb(0, 0.3, 0.8));
    drawText("Official Subscription Invoice", 50, height - 85, 14, rgb(0, 0, 0));
    drawText("-------------------------------------------------------------", 50, height - 95);

    // 🔹 Company Details
    drawText("Company Address:", 50, height - 115, 12, rgb(0, 0, 0.6));
    drawText("Kabaad Mandi, Haryana, India - 123106", 50, height - 130);
    drawText("Email: kabaadmandi@gmail.com", 50, height - 160);
    drawText("Phone: +91 80033 16534", 50, height - 175);

    drawText("-------------------------------------------------------------", 50, height - 190);

    // 🔹 Invoice Metadata
    drawText(`Invoice ID: INV-${subscription._id.toString().slice(-6)}`, 50, height - 210);
    drawText(`Invoice Date: ${new Date(subscription.startDate).toLocaleDateString()}`, 50, height - 225);
    drawText(`User Type: ${subscription.userType}`, 50, height - 240);

    drawText("-------------------------------------------------------------", 50, height - 255);

    // 🔹 Billed To
    drawText("Billed To:", 50, height - 275, 14, rgb(0, 0.2, 0.6));
    drawText(`Name: ${user.ownerName || user.name}`, 50, height - 295);
    drawText(`Email: ${user.email}`, 50, height - 310);
    drawText(`Phone: ${user.phone}`, 50, height - 325);

    drawText("-------------------------------------------------------------", 50, height - 345);

    // 🔹 Subscription Details
    drawText("Subscription Details", 50, height - 365, 14, rgb(0, 0.2, 0.6));
    drawText(`Plan: ${subscription.planName}`, 50, height - 385);
    drawText(`Start Date: ${new Date(subscription.startDate).toLocaleDateString()}`, 50, height - 400);
    drawText(`End Date: ${new Date(subscription.endDate).toLocaleDateString()}`, 50, height - 415);
    drawText(`Amount: INR ${subscription.amount}`, 50, height - 430);
    drawText(`Status: ${subscription.status}`, 50, height - 445);
    drawText(`Payment ID: ${subscription.paymentId || "N/A"}`, 50, height - 460);

    drawText("-------------------------------------------------------------", 50, height - 475);

    drawText("Thank you for choosing Kabaad Mandi!", 50, height - 500, 13, rgb(0, 0.3, 0.8));
    drawText("For support, contact us at kabaadmandi@gmail.com", 50, height - 515, 10, rgb(0.3, 0.3, 0.3));

    // ✅ Generate and return PDF
    const pdfBytes = await pdfDoc.save();
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=invoice_${subscription._id}.pdf`,
      },
    });
  } catch (error) {
    console.error("Invoice generation error:", error);
    return NextResponse.json({ error: "Failed to generate invoice" }, { status: 500 });
  }
}
