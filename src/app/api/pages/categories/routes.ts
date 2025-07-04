import { db } from "@/db/client";
import { sql } from "drizzle-orm";
import { requireSession } from "@/lib/guard";

export async function GET() {
  const { error } = await requireSession();
  if (error) return new Response("Unauthorized", { status: 401 });

  const categoriesResult = await db.execute(
    sql`
    SELECT DISTINCT jsonb_array_elements_text(category::jsonb) AS category
    FROM pages
  `,
  );

  const categories = (
    categoriesResult.rows as unknown as { category: string }[]
  ).map((row) => row.category);

  return Response.json({ categories });
}
