import { db } from "@/db/client";
import { sql } from "drizzle-orm";

export async function GET() {
  const tagsResult = await db.execute(
    sql`
      SELECT DISTINCT JSON_UNQUOTE(tag) as tag
      FROM links,
      JSON_TABLE(links.tags, '$[*]' COLUMNS(tag JSON PATH '$')) AS jt
    `,
  );

  console.log(tagsResult);

  const tags = tagsResult
    .map((row: any) => {
      const [tag] = row;
      return tag.tag;
    })
    .filter(Boolean);

  return Response.json({ tags });
}
