import { db } from "@/db/client";
import { pages } from "@/db/schema";
import { and, eq, ne } from "drizzle-orm";
import { NextResponse } from "next/server";

const reservedSlugs = ["admin", "login"];

export async function POST(req: Request) {
  const { slug, pageId } = await req.json();

  if (!slug || typeof slug !== "string") {
    return NextResponse.json(
      { valid: false, error: "Invalid slug." },
      { status: 400 },
    );
  }

  const normalized = slug.trim().toLowerCase();

  if (!/^[a-z0-9\-\/]+$/.test(normalized) && normalized !== "*") {
    return NextResponse.json({
      valid: false,
      error:
        "Slug can only contain lowercase letters, numbers, hyphens, and slashes.",
    });
  }

  if (normalized.startsWith("/") || normalized.endsWith("/")) {
    return NextResponse.json({
      valid: false,
      error: "Slug should not start or end with a slash.",
    });
  }

  const parts = normalized.split("/");
  if (parts.some((part) => reservedSlugs.includes(part))) {
    return NextResponse.json({
      valid: false,
      error: `Slug cannot contain reserved paths: ${reservedSlugs.join(", ")}`,
    });
  }

  // Check for duplicates for user
  const [existing] = await db
    .select({ id: pages.id })
    .from(pages)
    .where(
      and(
        eq(pages.slug, normalized),
        pageId ? ne(pages.id, pageId) : undefined,
      ),
    );

  if (existing) {
    return NextResponse.json({ valid: false, error: "Slug is already used." });
  }

  return NextResponse.json({ valid: true });
}
