import { db } from "@/db/client";
import { links } from "@/db/schema";
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
      (tag) => sql`
        EXISTS (
          SELECT 1 FROM json_array_elements_text(${links.tags}) AS tag
          WHERE tag = ${tag}
        )
      `,
    );

    whereConditions.push(and(...tagConditions));
  }

  // Add after parsing tags
  const attributeEntries = Array.from(searchParams.entries()).filter(
    ([key]) => key.startsWith("attributes[") && key.endsWith("]"),
  );

  for (const [fullKey, value] of attributeEntries) {
    const key = fullKey.slice(11, -1); // removes "attributes[" and "]"
    if (value) {
      whereConditions.push(
        sql`JSON_UNQUOTE(JSON_EXTRACT(${links.attributes}, ${sql.raw(`'$.${key}'`)})) = ${value}`,
      );
    }
  }
  const whereClause =
    whereConditions.length > 0 ? and(...whereConditions) : undefined;

  const [totalResult] = await db
    .select({ count: count() })
    .from(links)
    .where(whereClause);

  const results = await db
    .select({
      id: links.id,
      title: links.title,
      target: links.target,
      tags: links.tags,
      banner: links.banner,
      descriptions: links.descriptions,
      attributes: links.attributes,
      createdAt: links.created_at,
    })
    .from(links)
    .where(whereClause)
    .orderBy(links.created_at)
    .limit(limit)
    .offset(offset);

  return Response.json({
    links: results,
    total: Number(totalResult.count),
  });
}
