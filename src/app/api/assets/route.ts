import { NextResponse } from "next/server";
import { readdir, unlink, access } from "fs/promises";
import { constants } from "fs";
import path from "path";
import { requireSession } from "@/lib/guard";

export async function GET() {
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

export async function DELETE(req: Request) {
  const { error } = await requireSession();
  if (error) return new Response("Unauthorized", { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get("name");

    if (!filename) {
      return NextResponse.json(
        { error: "Missing 'name' query parameter" },
        { status: 400 },
      );
    }

    // Sanitize filename to prevent path traversal attacks
    if (filename.includes("..") || path.isAbsolute(filename)) {
      return NextResponse.json({ error: "Invalid file name" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), "public", "uploads", filename);

    // Check if file exists
    try {
      await access(filePath, constants.F_OK);
    } catch {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    await unlink(filePath);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete file:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 },
    );
  }
}
