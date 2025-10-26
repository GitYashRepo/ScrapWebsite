// src/app/api/blob-upload/route.js
import { upload } from '@vercel/blob';

export async function POST(req) {
  try {
    const data = await req.formData();
    const file = data.get('file');

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();

    const blob = await upload(arrayBuffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      name: file.name, 
    });

    return new Response(JSON.stringify({ url: blob.url }), { status: 200 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
