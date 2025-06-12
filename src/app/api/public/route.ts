import { db } from "@/db/client";
import { pages } from "@/db/schema";
import { like, count, and, sql, or } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "10");
  const offset = (page - 1) * limit;

  const tagFilter = searchParams.get("tags");
  const tags = tagFilter
    ? tagFilter
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const whereConditions = [];
  if (search) {
    const searchLower = search.toLowerCase();
    whereConditions.push(
      or(
        like(sql`LOWER(${pages.title})`, `%${searchLower}%`),
        like(sql`LOWER(${pages.metaTitle})`, `%${searchLower}%`),
      ),
    );
  }

  if (tags.length > 0) {
    // Build MySQL JSON_CONTAINS expression for each tag
    const tagConditions = tags.map(
      (tag) => sql`JSON_CONTAINS(${pages.tags}, JSON_QUOTE(${tag}))`,
    );
    // Add all tag filters using AND (i.e. must match all tags)
    whereConditions.push(or(...tagConditions));
  }

  const whereClause =
    whereConditions.length > 0 ? and(...whereConditions) : undefined;

  const [totalResult] = await db
    .select({ count: count() })
    .from(pages)
    .where(whereClause);

  const results = await db
    .select({
      id: pages.id,
      title: pages.title,
      slug: pages.slug,
      metaTitle: pages.metaTitle,
      metaDescription: pages.metaDescription,
      metaImage: pages.metaImage,
      iconImage: pages.iconImage,
      isPublic: pages.isPublic,
      createdAt: pages.createdAt,
    })
    .from(pages)
    .where(whereClause)
    .orderBy(pages.createdAt)
    .limit(limit)
    .offset(offset);

  return Response.json({
    pages: results,
    total: Number(totalResult.count),
  });
}
