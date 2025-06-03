import { NextRequest, NextResponse } from "next/server";
import { readdir } from "fs/promises";
import path from "path";

export async function GET(req: NextRequest) {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  let files = [];

  try {
    const filenames = await readdir(uploadsDir);
    // Filter out directories and only include image files (optional, but good practice)
    // You might want to enhance this to check for actual image types if there are other files
    files = filenames.filter((name) =>
      /\.(webp|jpeg|jpg|png|gif|svg)$/i.test(name),
    );

    // Map files to the format GrapesJS expects for src
    const assets = files.map((filename) => ({
      src: `/uploads/${filename}`,
      name: filename, // Optional: for display in GrapesJS
      type: "image", // Assuming they are all images in this folder
    }));

    return NextResponse.json(assets);
  } catch (error) {
    console.error("Failed to read uploads directory:", error);
    return NextResponse.json(
      { error: "Failed to retrieve assets" },
      { status: 500 },
    );
  }
}
