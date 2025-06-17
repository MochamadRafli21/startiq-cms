import { db } from "@/db/client";
import { sql } from "drizzle-orm";
import { requireSession } from "@/lib/guard";

export async function GET() {
  const { error } = await requireSession();
  if (error) return new Response("Unauthorized", { status: 401 });

  const [categoriesResult] = await db.execute(
    sql`
    SELECT DISTINCT JSON_UNQUOTE(category) as category
    FROM pages,
    JSON_TABLE(pages.category, '$[*]' COLUMNS(category JSON PATH '$')) AS jt
  `,
  );
  const categories = (
    categoriesResult as unknown as { category: string }[]
  ).map((row) => row.category);

  return Response.json({ categories });
}
