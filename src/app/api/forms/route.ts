import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { forms } from "@/db/schema";
import { like, sql, count, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const formName = searchParams.get("name");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "10");
  const offset = (page - 1) * limit;

  try {
    const whereConditions = [];

    if (formName) {
      const searchLower = formName.toLowerCase();
      whereConditions.push(like(sql`LOWER(${forms.name})`, `%${searchLower}%`));
    }

    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const [totalResult] = await db
      .select({ count: count() })
      .from(forms)
      .where(whereClause);

    const results = await db
      .select({
        id: forms.id,
        name: forms.name,
        data: forms.data,
        createdAt: forms.createdAt,
      })
      .from(forms)
      .where(whereClause)
      .orderBy(forms.createdAt)
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ forms: results, total: totalResult });
  } catch (err) {
    console.error("Error fetching forms:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
