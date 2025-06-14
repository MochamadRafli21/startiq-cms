import { db } from "@/db/client";
import { pages, templates } from "@/db/schema";
import fs from "fs/promises";
import path from "path";
import type { Page } from "@/types/page.type";
import type { Template } from "@/types/template.type";

async function seedFromFolder(
  relativeFolderPath: string,
  table: typeof pages | typeof templates,
) {
  const absolutePath = path.resolve(__dirname, relativeFolderPath);
  const files = await fs.readdir(absolutePath);

  for (const file of files) {
    if (!file.endsWith(".json")) continue;

    const filePath = path.join(absolutePath, file);
    const raw = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(raw);

    const title = "title" in data ? (data as Page | Template).title : file;

    try {
      await db.insert(table).values(data);
      console.log(`✅ Seeded: ${title}`);
    } catch (err) {
      console.error(`❌ Failed to seed ${title}:`, err);
    }
  }
}

async function seed() {
  console.log("🌱 Seeding templates...");
  await seedFromFolder("data/templates", templates);

  console.log("🌱 Seeding pages...");
  await seedFromFolder("data/pages", pages);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
});
