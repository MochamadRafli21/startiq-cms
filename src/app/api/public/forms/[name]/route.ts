import { db } from "@/db/client";
import { forms } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;

  const data = await req.json();

  const [{ id }] = await db
    .insert(forms)
    .values({
      name,
      data,
    })
    .$returningId();

  const [form] = await db.select().from(forms).where(eq(forms.id, id)).limit(1);

  return Response.json(form);
}
