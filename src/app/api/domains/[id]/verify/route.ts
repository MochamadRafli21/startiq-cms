import dns from "dns/promises";
import { db } from "@/db/client";
import { domains } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireSession } from "@/lib/guard";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireSession();
  if (error) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const [domain] = await db
    .select({
      domain: domains.domain,
      verified: domains.verified,
    })
    .from(domains)
    .where(eq(domains.id, parseInt(id)))
    .limit(1);

  let verified = false;

  try {
    const aRecords = await dns.resolve(domain.domain, "A");
    const aMatch = aRecords.includes(process.env.SERVER_IP || "");
    if (aMatch) {
      await db
        .update(domains)
        .set({
          verified: true,
        })
        .where(eq(domains.domain, domain.domain));

      verified = true;
    }
  } catch {
    verified = false;
  }

  return Response.json(verified);
}
