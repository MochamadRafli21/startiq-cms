import { db } from "@/db/client";
import { links, pages } from "@/db/schema";
import { like, count, and, sql } from "drizzle-orm";

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
    whereConditions.push(like(links.title, `%${search}%`));
  }

  if (tags.length > 0) {
    const tagConditions = tags.map(
      (tag) => sql`JSON_CONTAINS(${links.tags}, JSON_QUOTE(${tag}))`,
    );
    whereConditions.push(and(...tagConditions));
  }

  const attributeEntries = Array.from(searchParams.entries()).filter(
    ([key]) => key.startsWith("attributes[") && key.endsWith("]"),
  );

  for (const [fullKey, value] of attributeEntries) {
    const key = fullKey.slice(11, -1);
    if (value) {
      whereConditions.push(
        sql`JSON_UNQUOTE(JSON_EXTRACT(${links.attributes}, ${sql.raw(`'$.${key}'`)})) = ${value}`,
      );
    }
  }

  const whereClause =
    whereConditions.length > 0 ? and(...whereConditions) : undefined;

  // Count totals
  const [totalLinks] = await db
    .select({ count: count() })
    .from(links)
    .where(whereClause);
  const [totalPages] = await db
    .select({ count: count() })
    .from(pages)
    .where(whereClause);
  const totalResult = totalLinks.count + totalPages.count;

  // Fetch more than necessary, then slice
  const pageLimit = limit + offset;

  const rawLinks = await db
    .select({
      id: links.id,
      title: links.title,
      target: links.target,
      banner: links.banner,
      descriptions: links.descriptions,
      createdAt: links.createdAt,
      type: sql`'link'`.as("type"),
    })
    .from(links)
    .where(whereClause)
    .orderBy(links.createdAt)
    .limit(pageLimit);

  const rawPages = await db
    .select({
      id: pages.id,
      title: pages.metaTitle || pages.title,
      target: pages.slug,
      banner: pages.metaImage || pages.iconImage,
      descriptions: pages.metaDescription,
      createdAt: pages.createdAt,
      type: sql`'page'`.as("type"),
    })
    .from(pages)
    .where(whereClause)
    .orderBy(pages.createdAt)
    .limit(pageLimit);

  // Merge and sort by createdAt
  const merged = [...rawLinks, ...rawPages].sort(
    (a, b) =>
      new Date(b.createdAt as Date).getTime() -
      new Date(a.createdAt as Date).getTime(),
  );

  // Slice to get paginated result
  const paginated = merged.slice(offset, offset + limit);

  return Response.json({
    contents: paginated,
    total: Number(totalResult),
    page,
    limit,
  });
}
