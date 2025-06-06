import { db } from "@/db/client";
import { templates } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const [template] = await db
    .select()
    .from(templates)
    .where(eq(templates.id, Number(id)))
    .limit(1);

  if (!template) {
    return new Response(JSON.stringify({ error: "Template not found" }), {
      status: 404,
    });
  }

  return Response.json(template);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();

  await db
    .update(templates)
    .set({
      title: body.title,
      content: body.content,
    })
    .where(eq(templates.id, Number(id)));

  const [template] = await db
    .select()
    .from(templates)
    .where(eq(templates.id, Number(id)))
    .limit(1);

  return Response.json(template);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);

  await db.delete(templates).where(eq(templates.id, id));

  return Response.json({ success: true });
}
