import { db } from "@/db/client";
import { pages } from "@/db/schema";
import { PageFullRecord, PagePublicParams } from "@/types/page.type";
import { eq, and } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<PagePublicParams> },
) {
  const { slug } = await params;

  const [page] = await db
    .select()
    .from(pages)
    .where(and(eq(pages.slug, slug), eq(pages.is_public, true)))
    .limit(1);

  if (!page) {
    return new Response(JSON.stringify({ error: "Page not found" }), {
      status: 404,
    });
  }

  return Response.json(page as PageFullRecord);
}
