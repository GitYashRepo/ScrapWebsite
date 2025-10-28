import { NextResponse } from "next/server";
import connectDB from "@/lib/db/db";
import Subscription from "@/models/subscription/subscription";
import Seller from "@/models/user/seller";
import Buyer from "@/models/buyer/buyer";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";

export async function GET(req, context) {
  await connectDB();
  const { subscriptionId } = await context.params;

  try {
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription)
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });

    const userModel = subscription.userType === "Seller" ? Seller : Buyer;
    const user = await userModel.findById(subscription.userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const { width, height } = page.getSize();

    const drawText = (text, x, y, size = 12, color = rgb(0, 0, 0), useBold = false) =>
      page.drawText(String(text || ""), { x, y, size, font: useBold ? bold : font, color });

    // --- Logo (top-left) ---
    try {
      const logoPath = path.join(process.cwd(), "public", "Logo", "KabaadMandiNewLogo.png");
      if (fs.existsSync(logoPath)) {
        const logoImageBytes = fs.readFileSync(logoPath);
        const logoImage = await pdfDoc.embedPng(logoImageBytes);

        // Obtain original dims then cap width to 200px keeping aspect ratio
        const original = logoImage.scale(1);
        let logoWidth = original.width;
        let logoHeight = original.height;
        if (logoWidth > 200) {
          const scaleFactor = 200 / logoWidth;
          logoWidth = 200;
          logoHeight = logoHeight * scaleFactor;
        }

        // Move logo to top-left, flush near top margin
        const logoX = 50;
        const logoY = height - logoHeight - 20; // close to top
        page.drawImage(logoImage, {
          x: logoX,
          y: logoY,
          width: logoWidth,
          height: logoHeight,
        });
      }
    } catch (e) {
      console.warn("Logo load failed:", e);
    }

    // --- Company Header (Top Right Corner) ---
    const title = "Kabaad Mandi";
    const subtitle = "Official Subscription Invoice";
    const titleWidth = bold.widthOfTextAtSize(title, 24);
    const subtitleWidth = font.widthOfTextAtSize(subtitle, 12);
    const rightMargin = 50;

    drawText(title, width - rightMargin - titleWidth, height - 50, 24, rgb(0, 0.3, 0.8), true);
    drawText(subtitle, width - rightMargin - subtitleWidth, height - 72, 12, rgb(0.2, 0.2, 0.2));

    // horizontal separator (below header area)
    page.drawLine({
      start: { x: 50, y: height - 95 },
      end: { x: width - 50, y: height - 95 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });

    // --- Company info (left, under logo) ---
    let y = height - 110;
    drawText("Kabaad Mandi", 50, y, 12, rgb(0, 0, 0.6), true);
    drawText("Haryana, India - 123106", 50, (y -= 15));
    drawText("Email: kabaadmandi@gmail.com", 50, (y -= 15));
    drawText("Phone: +91 80033-16534", 50, (y -= 15));

    // --- Invoice meta box (moved upwards, right) ---
    const boxTop = height - 100; // moved up for better alignment with header
    const boxHeight = 75;
    const boxX = width - 230;
    const boxW = 180;

    // subtle background for the box
    page.drawRectangle({
      x: boxX,
      y: boxTop - boxHeight,
      width: boxW,
      height: boxHeight,
      color: rgb(0.98, 0.98, 0.98),
      borderColor: rgb(0.75, 0.75, 0.75),
      borderWidth: 1,
    });

    // Format dates safely
    const startDate = subscription.startDate ? new Date(subscription.startDate) : null;
    const endDate = subscription.endDate ? new Date(subscription.endDate) : null;
    const formattedStart = startDate ? startDate.toLocaleDateString() : "N/A";
    const formattedEnd = endDate ? endDate.toLocaleDateString() : "N/A";

    drawText(`Invoice ID: INV-${subscription._id.toString().slice(-6)}`, boxX + 10, boxTop - 20, 10);
    drawText(`User Type: ${subscription.userType}`, boxX + 10, boxTop - 35, 10);
    drawText(`Start Date: ${formattedStart}`, boxX + 10, boxTop - 50, 10);
    drawText(`End Date: ${formattedEnd}`, boxX + 10, boxTop - 65, 10);

    // --- Bill To ---
    y = height - 210;
    drawText("Bill To:", 50, y, 14, rgb(0, 0.3, 0.8), true);
    drawText(user.ownerName || user.name || "N/A", 50, (y -= 20));
    drawText(user.email || "N/A", 50, (y -= 15));
    drawText(user.phone || "N/A", 50, (y -= 15));

    // --- Table header ---
    y -= 30;
    const tableX = 50;
    const tableW = 495;
    const headerH = 28;
    page.drawRectangle({
      x: tableX,
      y: y - headerH + 4,
      width: tableW,
      height: headerH,
      color: rgb(0.88, 0.92, 1),
    });
    drawText("Description", tableX + 10, y - 7, 12, rgb(0, 0, 0), true);
    drawText("Price", 340, y - 7, 12, rgb(0, 0, 0), true);
    drawText("Status", 420, y - 7, 12, rgb(0, 0, 0), true);
    drawText("Amount", 500, y - 7, 12, rgb(0, 0, 0), true);

    // --- Table body (single row) ---
    y -= 40;
    const description = (subscription.planName || "").replace(/_/g, " ");
    drawText(description, tableX + 10, y, 11);
    drawText(`INR ${subscription.amount ?? 0}`, 340, y, 11);
    drawText(subscription.status || "N/A", 420, y, 11);
    drawText(`INR ${subscription.amount ?? 0}`, 500, y, 11);

    // --- Totals ---
    y -= 40;
    page.drawLine({
      start: { x: 340, y: y + 25 },
      end: { x: width - 50, y: y + 25 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });

    drawText("Total:", 420, y + 5, 12, rgb(0, 0, 0), true);
    drawText(`INR ${subscription.amount ?? 0}`, 500, y + 5, 12, rgb(0, 0, 0), true);

    // --- Footer ---
    drawText("Thank you for choosing Kabaad Mandi!", 50, 110, 12, rgb(0, 0.3, 0.8), true);
    drawText("For support, contact kabaadmandi@gmail.com", 50, 95, 10, rgb(0.4, 0.4, 0.4));

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
