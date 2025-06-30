import { NextResponse } from "next/server";
import { requireSession } from "@/lib/guard";
import cloudinary from "@/lib/cloudinary";
import type { CloudinaryFile } from "@/types/cloudinary.type";

export async function GET() {
  try {
    const result = await cloudinary.search
      .expression("folder:uploads AND resource_type:image")
      .sort_by("created_at", "desc")
      .max_results(100) // Adjust as needed
      .execute();
    const assets = result.resources.map((resource: CloudinaryFile) => ({
      src: resource.secure_url,
      name: resource.display_name,
      type: resource.resource_type,
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
    const publicId = searchParams.get("name");

    if (!publicId) {
      return NextResponse.json(
        { error: "Missing 'name' query parameter" },
        { status: 400 },
      );
    }

    // Optional: validate input to avoid unexpected deletions
    if (
      publicId.includes("..") ||
      publicId.includes("/") ||
      publicId.includes("\\")
    ) {
      return NextResponse.json({ error: "Invalid public_id" }, { status: 400 });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== "ok") {
      return NextResponse.json(
        { error: "File not found or failed to delete" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete from Cloudinary:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
