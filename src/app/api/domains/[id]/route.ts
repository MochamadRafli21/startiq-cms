import { db } from "@/db/client";
import { domains } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  await db.delete(domains).where(eq(domains.id, Number(id)));

  return Response.json({ success: true });
}
