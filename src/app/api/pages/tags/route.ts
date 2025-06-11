import { db } from "@/db/client";
import { sql } from "drizzle-orm";

export async function GET() {
  const tagsResult = await db.execute(
    sql`
      SELECT DISTINCT JSON_UNQUOTE(tag) as tag
      FROM pages,
      JSON_TABLE(pages.tags, '$[*]' COLUMNS(tag JSON PATH '$')) AS jt
    `,
  );

  const tags = tagsResult.map((row: any) => row.tag).filter(Boolean);

  return Response.json({ tags });
}
