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
          like(sql`LOWER(${pages.metaTitle})`, `%${searchLower}%`),
        ),
      ),
    );
  }

  if (tags.length > 0) {
    // Build MySQL JSON_CONTAINS expression for each tag
    const tagConditions = tags.map(
      (tag) => sql`JSON_CONTAINS(${pages.tags}, JSON_QUOTE(${tag}))`,
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
      isPublic: pages.isPublic,
      createdAt: pages.createdAt,
    })
    .from(pages)
    .where(whereClause)
    .orderBy(pages.createdAt)
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
      isPublic: body.isPublic,
      content: body.content,
      contentCss: body.contentCss,
      contentHtml: body.contentHtml,
      metaImage: body.metaImage,
      metaTitle: body.metaTitle,
      iconImage: body.iconImage,
      metaDescription: body.metaDescription,
    })
    .$returningId();

  const [page] = await db.select().from(pages).where(eq(pages.id, id)).limit(1);

  return Response.json(page);
}
