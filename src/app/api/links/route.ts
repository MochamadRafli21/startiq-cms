import { db } from "@/db/client";
import { links } from "@/db/schema";
import { like, count, eq, and, sql } from "drizzle-orm";

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
    whereConditions.push(like(links.title, `%${search}%`));
  }

  if (tags.length > 0) {
    // Build MySQL JSON_CONTAINS expression for each tag
    const tagConditions = tags.map(
      (tag) => sql`JSON_CONTAINS(${links.tags}, JSON_QUOTE(${tag}))`,
    );

    // Add all tag filters using AND (i.e. must match all tags)
    whereConditions.push(and(...tagConditions));
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
      createdAt: links.createdAt,
    })
    .from(links)
    .where(whereClause)
    .orderBy(links.createdAt)
    .limit(limit)
    .offset(offset);

  return Response.json({
    links: results,
    total: Number(totalResult.count),
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const [{ id }] = await db
    .insert(links)
    .values({
      title: body.title,
      target: body.target,
      descriptions: body.descriptions,
      banner: body.banner,
      tags: body.tags,
      attributes: body.attributes,
    })
    .$returningId();

  const [link] = await db.select().from(links).where(eq(links.id, id)).limit(1);

  return Response.json(link);
}
