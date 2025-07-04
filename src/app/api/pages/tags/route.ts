import { db } from "@/db/client";
import { sql } from "drizzle-orm";
import { requireSession } from "@/lib/guard";

export async function GET() {
  const { error } = await requireSession();
  if (error) return new Response("Unauthorized", { status: 401 });

  const tagsResult = await db.execute(
    sql`
    SELECT DISTINCT jsonb_array_elements_text(tags::jsonb) AS tag
    FROM pages
  `,
  );

  const tags = (tagsResult.rows as unknown as { tag: string }[]).map(
    (row) => row.tag,
  );

  return Response.json({ tags });
}
