import { db } from "@/db/client";
import { pages, templates, links } from "@/db/schema";
import fs from "fs/promises";
import path from "path";
import type { PageBodyInput } from "@/types/page.type";
import type { Template } from "@/types/template.type";
import type { Link } from "@/types/link.type";

type CommonFields = {
  id?: number;
  created_at?: string;
  updated_at?: string;
};

// Enforce that all seed types must have a title (required by your DB)
type WithTitle = { title: string } & CommonFields;
type PageSeed = PageBodyInput & WithTitle;
type TemplateSeed = Template & WithTitle;
type LinkSeed = Link & WithTitle;

function sanitize<T extends WithTitle>(
  data: T,
): Omit<T, "id" | "created_at" | "updated_at"> {
  const copy = { ...data };
  delete copy.id;
  delete copy.created_at;
  delete copy.updated_at;
  return copy;
}

async function seedFromFolder<T extends WithTitle>(
  relativeFolderPath: string,
  table: typeof pages | typeof templates | typeof links,
) {
  const absolutePath = path.resolve(__dirname, relativeFolderPath);
  const files = await fs.readdir(absolutePath);

  for (const file of files) {
    if (!file.endsWith(".json")) continue;

    const filePath = path.join(absolutePath, file);
    const raw = await fs.readFile(filePath, "utf-8");
    const data: T | T[] = JSON.parse(raw);

    const records = Array.isArray(data) ? data : [data];

    for (const item of records) {
      const cleaned = sanitize(item);

      try {
        await db.insert(table).values(cleaned);
        console.log(`✅ Seeded: ${cleaned.title}`);
      } catch (err) {
        console.error(`❌ Failed to seed ${cleaned.title}:`, err);
      }
    }
  }
}

async function seed() {
  console.log("🌱 Seeding templates...");
  await seedFromFolder<TemplateSeed>("data/templates", templates);

  console.log("🌱 Seeding pages...");
  await seedFromFolder<PageSeed>("data/pages", pages);

  console.log("🌱 Seeding links...");
  await seedFromFolder<LinkSeed>("data/links", links);

  console.log("------✅ Seed Completed-----");
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
});
