import { db } from "@/db/client";
import { sql } from "drizzle-orm";

export async function GET() {
  const [tagsResult] = await db.execute(
    sql`
    SELECT DISTINCT JSON_UNQUOTE(tag) as tag
    FROM links,
    JSON_TABLE(links.tags, '$[*]' COLUMNS(tag JSON PATH '$')) AS jt
  `,
  );
  const tags = (tagsResult as unknown as { tag: string }[]).map(
    (row) => row.tag,
  );

  return Response.json({ tags });
}
