import { NextResponse } from "next/server";
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
    console.error("Cloudinary fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch assets" },
      { status: 500 },
    );
  }
}
