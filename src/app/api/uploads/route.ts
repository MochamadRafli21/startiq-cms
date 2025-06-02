import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { mkdir } from "fs/promises";
import sharp from "sharp";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Invalid file" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
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

  const fileUrl = `/uploads/${webpFilename}`;
  return NextResponse.json({ url: fileUrl });
}
