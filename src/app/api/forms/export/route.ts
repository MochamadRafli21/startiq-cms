import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { forms } from "@/db/schema";
import { and, like, gte, lte } from "drizzle-orm";
import { convertToCSV } from "@/utils/json/convertCsv";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const conditions = [];

    if (name) {
      conditions.push(like(forms.name, `%${name}%`));
    }

    if (startDate) {
      const parsed = new Date(startDate);
      if (!isNaN(parsed.getTime())) {
        conditions.push(gte(forms.created_at, parsed));
      }
    }

    if (endDate) {
      const parsed = new Date(endDate);
      if (!isNaN(parsed.getTime())) {
        conditions.push(lte(forms.created_at, parsed));
      }
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const allForms = await db.select().from(forms).where(where);

    const flattenedData = allForms.flatMap((form) => {
      const parsedData = form.data ?? {};
      return {
        id: form.id.toString(),
        name: form.name || "",
        ...parsedData,
        createdAt: form.created_at?.toLocaleString() || "",
        updatedAt: form.updated_at?.toLocaleString() || "",
      };
    });

    const csv = convertToCSV(flattenedData);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="forms_export.csv"`,
      },
    });
  } catch (err) {
    console.error("CSV export error:", err);
    return NextResponse.json(
      { error: "Failed to export CSV" },
      { status: 500 },
    );
  }
}
