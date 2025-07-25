import { db } from "@/db/client";
import { pages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireSession } from "@/lib/guard";
import { PageFullRecord } from "@/types/page.type";
import { ProjectData } from "grapesjs";

export async function POST(
  _req: Request,
  { params }: { params: Promise<PageFullRecord> },
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
      is_public: false,
      content: body.content as ProjectData,
      meta_image: body.meta_image,
      meta_title: body.meta_title,
      icon_image: body.icon_image,
      meta_description: body.meta_description,
    })
    .returning();

  const [page] = await db
    .select()
    .from(pages)
    .where(eq(pages.id, newId))
    .limit(1);

  return Response.json(page as PageFullRecord);
}
