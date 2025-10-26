import { put } from "@vercel/blob";

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

    // Generate a unique file name
    const timestamp = Date.now();
    const uniqueName = `${timestamp}-${file.name}`;

    // Upload to Vercel Blob Storage
    const blob = await put(uniqueName, file, {
      access: "public", // Makes it publicly accessible
    });

    // blob.url will be the full public URL of the image
    return new Response(JSON.stringify({ url: blob.url }), { status: 200 });
  } catch (error) {
    console.error("Upload error:", error);
    return new Response(JSON.stringify({ error: "Upload failed" }), { status: 500 });
  }
}
