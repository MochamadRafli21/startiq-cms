import { db } from "@/db/client";
import { pages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireSession } from "@/lib/guard";
import type {
  PageBodyInput,
  PageFullRecord,
  PageParams,
} from "@/types/page.type";

export async function GET(
  _req: Request,
  { params }: { params: Promise<PageParams> },
) {
  const { error } = await requireSession();
  if (error) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;

  const [page] = await db
    .select()
    .from(pages)
    .where(eq(pages.id, Number(id)))
    .limit(1);

  if (!page) {
    return new Response(JSON.stringify({ error: "Page not found" }), {
      status: 404,
    });
  }

  return Response.json(page as PageFullRecord);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<PageParams> },
) {
  const { error } = await requireSession();
  if (error) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const body: PageBodyInput = await req.json();

  await db
    .update(pages)
    .set({
      title: body.title,
      slug: body.slug,
      tags: body.tags,
      category: body.category,
      is_public: body.is_public,
      content: body.content,
      html: body.html,
      css: body.css,
      meta_image: body.meta_image,
      meta_title: body.meta_title,
      meta_description: body.meta_description,
      icon_image: body.icon_image,
    })
    .where(eq(pages.id, Number(id)));

  const [page] = await db
    .select()
    .from(pages)
    .where(eq(pages.id, Number(id)))
    .limit(1);

  return Response.json(page as PageFullRecord);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<PageParams> },
) {
  const { error } = await requireSession();
  if (error) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;

  await db.delete(pages).where(eq(pages.id, Number(id)));

  return Response.json({ success: true });
}
