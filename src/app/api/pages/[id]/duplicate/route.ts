import { db } from "@/db/client";
import { pages } from "@/db/schema";
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
    .from(pages)
    .where(eq(pages.id, Number(id)))
    .limit(1);

  const [{ id: newId }] = await db
    .insert(pages)
    .values({
      title: body.title,
      slug: body.slug + "-duplicated",
      tags: body.tags,
      isPublic: false,
      content: body.content,
      metaImage: body.metaImage,
      metaTitle: body.metaTitle,
      iconImage: body.iconImage,
      metaDescription: body.metaDescription,
    })
    .$returningId();

  const [page] = await db
    .select()
    .from(pages)
    .where(eq(pages.id, newId))
    .limit(1);

  return Response.json(page);
}
