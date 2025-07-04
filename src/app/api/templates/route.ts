import { db } from "@/db/client";
import { templates } from "@/db/schema";
import { like, count, and, eq } from "drizzle-orm";
import { requireSession } from "@/lib/guard";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { error } = await requireSession();
  if (error) return new Response("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "10");
  const offset = (page - 1) * limit;

  const whereConditions = [];

  if (search) {
    whereConditions.push(like(templates.title, `%${search}%`));
  }

  const whereClause =
    whereConditions.length > 0 ? and(...whereConditions) : undefined;

  const [totalResult] = await db
    .select({ count: count() })
    .from(templates)
    .where(whereClause);

  const results = await db
    .select()
    .from(templates)
    .where(whereClause)
    .orderBy(templates.createdAt)
    .limit(limit)
    .offset(offset);

  return Response.json({
    templates: results,
    total: Number(totalResult.count),
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const [{ id }] = await db
    .insert(templates)
    .values({
      title: body.title,
      content: body.content,
    })
    .returning();

  const [template] = await db
    .select()
    .from(templates)
    .where(eq(templates.id, id))
    .limit(1);

  return Response.json(template);
}
