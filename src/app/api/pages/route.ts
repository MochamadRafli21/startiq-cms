import { db } from "@/db/client";
import { pages } from "@/db/schema";
import { like, count, eq, and, sql, or } from "drizzle-orm";
import { requireSession } from "@/lib/guard";
import type { PageQuery, PageResponse, PageBodyInput } from "@/types/page.type";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { error } = await requireSession();
  if (error) return new Response("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const query: PageQuery = {
    search: searchParams.get("search") ?? "",
    page: parseInt(searchParams.get("page") ?? "1"),
    limit: parseInt(searchParams.get("limit") ?? "10"),
  };

  const offset = ((query.page || 1) - 1) * (query.limit || 10);

  const tagFilter = searchParams.get("tags");
  const tags = tagFilter
    ? tagFilter
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const whereConditions = [];

  if (query.search) {
    const searchLower = query.search.toLowerCase();
    whereConditions.push(
      and(
        or(
          like(sql`LOWER(${pages.title})`, `%${searchLower}%`),
          like(sql`LOWER(${pages.meta_title})`, `%${searchLower}%`),
        ),
      ),
    );
  }

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
      is_public: pages.is_public,
      created_at: pages.created_at,
    })
    .from(pages)
    .where(whereClause)
    .orderBy(pages.created_at)
    .limit(query.limit || 10)
    .offset(offset);

  const response: PageResponse = {
    pages: results,
    total: Number(totalResult.count),
  };

  return Response.json(response);
}

export async function POST(req: Request) {
  const { error } = await requireSession();
  if (error) return new Response("Unauthorized", { status: 401 });

  const body: PageBodyInput = await req.json();
  const [{ id }] = await db
    .insert(pages)
    .values({
      title: body.title,
      slug: body.slug,
      tags: body.tags,
      category: body.category,
      is_public: body.is_public,
      content: body.content,
      css: body.css,
      html: body.html,
      meta_image: body.meta_image,
      meta_title: body.meta_title,
      icon_image: body.icon_image,
      meta_description: body.meta_description,
    })
    .returning();

  const [page] = await db.select().from(pages).where(eq(pages.id, id)).limit(1);

  return Response.json(page);
}
