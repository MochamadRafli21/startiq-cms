import { NextRequest, NextResponse } from "next/server";

import cloudinary from "@/lib/cloudinary";
import { Readable } from "stream";
import type { CloudinaryFile } from "@/types/cloudinary.type";
import { requireSession } from "@/lib/guard";

export async function POST(req: NextRequest) {
  const { error } = await requireSession();
  if (error) return new Response("Unauthorized", { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Invalid file" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Only image uploads allowed" },
      { status: 400 },
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    // Convert Buffer to Readable Stream
    const bufferToStream = (buffer: Buffer) => {
      const readable = new Readable();
      readable.push(buffer);
      readable.push(null);
      return readable;
    };

    const stream = bufferToStream(buffer);

    const uploadPromise = () =>
      new Promise((resolve, reject) => {
        const cloudStream = cloudinary.uploader.upload_stream(
          {
            folder: "uploads", // Optional: organize under 'uploads/'
            resource_type: "image",
            use_filename: true,
            unique_filename: true, // prevents name clashes
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );

        stream.pipe(cloudStream);
      });

    const result = (await uploadPromise()) as CloudinaryFile;

    return NextResponse.json({
      data: [
        {
          src: result.secure_url,
          name: result.display_name,
          type: result.resource_type,
        },
      ],
    });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
