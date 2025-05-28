import { db } from "@/db/client";
import { pages } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);

  const [page] = await db.select().from(pages).where(eq(pages.id, id)).limit(1);

  if (!page) {
    return new Response(JSON.stringify({ error: "Page not found" }), {
      status: 404,
    });
  }

  return Response.json(page);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);
  const body = await req.json();

  await db
    .update(pages)
    .set({
      title: body.title,
      slug: body.slug,
      tags: body.tags,
      isPublic: body.isPublic,
      content: body.content,
    })
    .where(eq(pages.id, id));

  const [page] = await db.select().from(pages).where(eq(pages.id, id)).limit(1);

  return Response.json(page);
}

export async function DELETE({ params }: { params: { id: string } }) {
  const id = Number(params.id);

  await db.delete(pages).where(eq(pages.id, id));

  return Response.json({ success: true });
}
