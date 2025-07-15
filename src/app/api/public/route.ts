import { db } from "@/db/client";
import { pages } from "@/db/schema";
import { PageResponse } from "@/types/page.type";
import { like, count, and, sql, or } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "10");
  const offset = (page - 1) * limit;

  const whereConditions = [];

  const tagFilter = searchParams.get("tags");
  const tags = tagFilter
    ? tagFilter
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  if (tags.length > 0) {
    // Build MySQL JSON_CONTAINS expression for each tag
    const tagConditions = tags.map(
      (tag) => sql`
        EXISTS (
          SELECT 1 FROM json_array_elements_text(${pages.tags}) AS tag
          WHERE tag = ${tag}
        )
      `,
    );
    // Add all tag filters using AND (i.e. must match all tags)
    whereConditions.push(and(...tagConditions));
  }

  const categoryFilter = searchParams.get("category");
  const category = categoryFilter
    ? categoryFilter
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
    : [];

  if (category.length > 0) {
    // Build MySQL JSON_CONTAINS expression for each tag
    const categoryConditions = category.map(
      (cat) => sql`
        EXISTS (
          SELECT 1 FROM json_array_elements_text(${pages.category}) AS cat
          WHERE cat = ${cat}
        )
      `,
    );
    // Add all tag filters using AND (i.e. must match all tags)
    whereConditions.push(and(...categoryConditions));
  }

  if (search) {
    const searchLower = search.toLowerCase();
    whereConditions.push(
      or(
        like(sql`LOWER(${pages.title})`, `%${searchLower}%`),
        like(sql`LOWER(${pages.meta_title})`, `%${searchLower}%`),
      ),
    );
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
      meta_title: pages.meta_title,
      meta_description: pages.meta_description,
      meta_image: pages.meta_image,
      icon_image: pages.icon_image,
      is_public: pages.is_public,
      created_at: pages.created_at,
    })
    .from(pages)
    .where(whereClause)
    .orderBy(pages.created_at)
    .limit(limit)
    .offset(offset);
  const response: PageResponse = {
    pages: results,
    total: Number(totalResult.count),
  };

  return Response.json(response);
}
