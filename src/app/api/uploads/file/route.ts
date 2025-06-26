import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { mkdir } from "fs/promises";
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
  const filename = `${Date.now()}-${baseName}`;
  const filePath = path.join(uploadDir, filename);

  try {
    await writeFile(filePath, buffer);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to process file" },
      { status: 500 },
    );
  }

  // IMPORTANT: Construct the full URL for GrapesJS
  // In a Next.js public folder, files are served directly from the root.
  // So, if your app is at `http://localhost:3000`,
  // and the file is in `public/uploads/myimage.webp`,
  // the URL will be `http://localhost:3000/uploads/myimage.webp`.
  const fileUrl = `/uploads/${filename}`;

  // *** MODIFICATION HERE ***
  // Return in the format GrapesJS expects for asset uploads
  return NextResponse.json({
    data: [
      {
        src: fileUrl, // The URL must be accessible from the browser
        name: filename, // Optional: display name in Asset Manager
        type: "image", // Optional: explicit type
        // You can add other properties like width, height if you extract them
      },
    ],
  });
}
