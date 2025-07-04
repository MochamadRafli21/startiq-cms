import { db } from "@/db/client";
import { templates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireSession } from "@/lib/guard";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireSession();
  if (error) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;

  const [body] = await db
    .select()
    .from(templates)
    .where(eq(templates.id, Number(id)))
    .limit(1);

  const [{ id: newId }] = await db
    .insert(templates)
    .values({
      title: body.title + "-duplicated",
      content: body.content,
    })
    .returning();

  const [template] = await db
    .select()
    .from(templates)
    .where(eq(templates.id, newId))
    .limit(1);

  return Response.json(template);
}
