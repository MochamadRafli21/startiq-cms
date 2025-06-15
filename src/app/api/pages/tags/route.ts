import { db } from "@/db/client";
import { sql } from "drizzle-orm";
import { requireSession } from "@/lib/guard";

export async function GET() {
  const { error } = await requireSession();
  if (error) return new Response("Unauthorized", { status: 401 });

  const [tagsResult] = await db.execute(
    sql`
    SELECT DISTINCT JSON_UNQUOTE(tag) as tag
    FROM pages,
    JSON_TABLE(pages.tags, '$[*]' COLUMNS(tag JSON PATH '$')) AS jt
  `,
  );
  const tags = (tagsResult as unknown as { tag: string }[]).map(
    (row) => row.tag,
  );

  return Response.json({ tags });
}
