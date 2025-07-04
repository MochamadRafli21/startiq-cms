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

  const linkWhereConditions = [];
  const pageWhereConditions = [];

  if (search) {
    linkWhereConditions.push(like(links.title, `%${search}%`));
    pageWhereConditions.push(like(pages.title, `%${search}%`));
  }

  if (tags.length > 0) {
    const linkTagConditions = tags.map(
      (tag) => sql`
        EXISTS (
          SELECT 1 FROM json_array_elements_text(${links.tags}) AS tag
          WHERE tag = ${tag}
        )
      `,
    );
    linkWhereConditions.push(and(...linkTagConditions));

    const pageTagConditions = tags.map(
      (tag) => sql`
        EXISTS (
          SELECT 1 FROM json_array_elements_text(${pages.tags}) AS tag
          WHERE tag = ${tag}
        )
      `,
    );
    pageWhereConditions.push(and(...pageTagConditions));
  }

  const attributeEntries = Array.from(searchParams.entries()).filter(
    ([key]) => key.startsWith("attributes[") && key.endsWith("]"),
  );

  for (const [fullKey, value] of attributeEntries) {
    const key = fullKey.slice(11, -1);
    const safeKey = key.replace(/[^a-zA-Z0-9_]/g, "");
    if (value) {
      linkWhereConditions.push(
        sql`${sql.raw(`(${links.attributes} ->> ${safeKey})`)} = ${value}`,
      );
    }
  }

  const linkWhereClause =
    linkWhereConditions.length > 0 ? and(...linkWhereConditions) : undefined;
  const pageWhereClause =
    pageWhereConditions.length > 0 ? and(...pageWhereConditions) : undefined;

  // Count totals
  const [totalLinks] = await db
    .select({ count: count() })
    .from(links)
    .where(linkWhereClause);
  const [totalPages] = await db
    .select({ count: count() })
    .from(pages)
    .where(pageWhereClause);
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
    .where(linkWhereClause)
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
    .where(pageWhereClause)
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
