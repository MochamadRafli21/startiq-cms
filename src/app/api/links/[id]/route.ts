import { db } from "@/db/client";
import { links } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const [page] = await db
    .select()
    .from(links)
    .where(eq(links.id, Number(id)))
    .limit(1);

  if (!page) {
    return new Response(JSON.stringify({ error: "Page not found" }), {
      status: 404,
    });
  }

  return Response.json(page);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();

  await db
    .update(links)
    .set({
      title: body.title,
      tags: body.tags,
      banner: body.banner,
      descriptions: body.descriptions,
    })
    .where(eq(links.id, Number(id)));

  const [link] = await db
    .select()
    .from(links)
    .where(eq(links.id, Number(id)))
    .limit(1);

  return Response.json(link);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);

  await db.delete(links).where(eq(links.id, id));

  return Response.json({ success: true });
}
