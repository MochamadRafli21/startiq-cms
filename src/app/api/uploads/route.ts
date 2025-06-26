import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { mkdir } from "fs/promises";
import sharp from "sharp";
import { requireSession } from "@/lib/guard";

export async function POST(req: NextRequest) {
  const { error } = await requireSession();
  if (error) return new Response("Unauthorized", { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Invalid file" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  // The path to your public folder for uploads
  const uploadDir = path.join(process.cwd(), "public", "uploads");

  await mkdir(uploadDir, { recursive: true });

  const baseName = file.name.replace(/\.[^/.]+$/, "");
  const webpFilename = `${Date.now()}-${baseName}.webp`;
  const webpPath = path.join(uploadDir, webpFilename);

  // Convert to WebP
  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Only image uploads are allowed" },
      { status: 400 },
    );
  }
  try {
    const webp = await sharp(buffer).webp({ quality: 80 }).toBuffer();
    await writeFile(webpPath, webp);
  } catch (err) {
    console.error("Image conversion error:", err);
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 },
    );
  }

  // IMPORTANT: Construct the full URL for GrapesJS
  // In a Next.js public folder, files are served directly from the root.
  // So, if your app is at `http://localhost:3000`,
  // and the file is in `public/uploads/myimage.webp`,
  // the URL will be `http://localhost:3000/uploads/myimage.webp`.
  const fileUrl = `/uploads/${webpFilename}`;

  // *** MODIFICATION HERE ***
  // Return in the format GrapesJS expects for asset uploads
  return NextResponse.json({
    data: [
      {
        src: fileUrl, // The URL must be accessible from the browser
        name: webpFilename, // Optional: display name in Asset Manager
        type: "image", // Optional: explicit type
        // You can add other properties like width, height if you extract them
      },
    ],
  });
}
