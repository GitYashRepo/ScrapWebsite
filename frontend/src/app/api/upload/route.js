import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return new Response(JSON.stringify({ error: "Only image files are allowed" }), { status: 400 });
    }

    // Limit file size to 2 MB (typical web-safe limit)
    const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
    if (file.size > MAX_SIZE) {
      return new Response(JSON.stringify({ error: "File too large (max 2 MB)" }), { status: 400 });
    }

    // Convert file to Buffer for upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uniqueName = `${Date.now()}-${file.name}`;

    // Now call the new `put()` with token explicitly passed
    const blob = await put(uniqueName, buffer, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN, // ✅ must be provided explicitly in v2
      contentType: file.type,
    });

    return NextResponse.json({ url: blob.url }, { status: 200 });
  } catch (error) {
    console.error("Upload error:", error);
    return new Response(JSON.stringify({ error: "Upload failed" }), { status: 500 });
  }
}
