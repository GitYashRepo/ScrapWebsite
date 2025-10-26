import { genUploadUrl } from "@vercel/blob";

export async function POST() {
  try {
    // Create a one-time upload URL
    const { url } = await genUploadUrl({
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN, // explicitly required in v2
    });

    return new Response(JSON.stringify({ url }), { status: 200 });
  } catch (error) {
    console.error("Error creating upload URL:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
