import { db } from "@/db/client";
import { pages } from "@/db/schema";
import { like, count } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "10");
  const offset = (page - 1) * limit;

  const [totalResult] = await db
    .select({ count: count() })
    .from(pages)
    .where(search ? like(pages.title, `%${search}%`) : undefined);

  const results = await db
    .select()
    .from(pages)
    .where(search ? like(pages.title, `%${search}%`) : undefined)
    .orderBy(pages.createdAt)
    .limit(limit)
    .offset(offset);

  return Response.json({
    pages: results,
    total: Number(totalResult.count),
  });
}
