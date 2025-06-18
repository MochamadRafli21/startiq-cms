import { db } from "@/db/client";
import { eq } from "drizzle-orm";
import { domains, pages } from "@/db/schema";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ host: string }> },
) {
  const { host } = await params;
  const [domain] = await db
    .select({
      id: domains.id,
      domain: domains.domain,
      verified: domains.verified,
      defaultPageId: domains.defaultPageId,
      slug: pages.slug,
    })
    .from(domains)
    .leftJoin(pages, eq(domains.defaultPageId, pages.id))
    .where(eq(domains.domain, host))
    .limit(1);
  if (!domain) {
    return new Response(JSON.stringify({ error: "Page not found" }), {
      status: 404,
    });
  }
  return Response.json(domain);
}
