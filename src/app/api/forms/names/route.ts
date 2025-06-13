import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { forms } from "@/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  try {
    const names = await db
      .selectDistinct({ name: forms.name })
      .from(forms)
      .orderBy(asc(forms.name));

    return NextResponse.json({ forms: names.map((f) => f.name) });
  } catch (err) {
    console.error("Error fetching form names:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
