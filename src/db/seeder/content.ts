import { db } from "@/db/client";
import { pages, templates, links } from "@/db/schema";
import fs from "fs/promises";
import path from "path";
import type { PageBodyInput } from "@/types/page.type";
import type { Template } from "@/types/template.type";
import type { Link } from "@/types/link.type";

type ContentTypes = PageBodyInput | Template | Link;

async function seedFromFolder(
  relativeFolderPath: string,
  table: typeof pages | typeof templates | typeof links,
) {
  const absolutePath = path.resolve(__dirname, relativeFolderPath);
  const files = await fs.readdir(absolutePath);

  for (const file of files) {
    if (!file.endsWith(".json")) continue;

    const filePath = path.join(absolutePath, file);
    const raw = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(raw);
    if (Array.isArray(data)) {
      data.forEach(async (innerData) => {
        const title =
          "title" in innerData ? (innerData as ContentTypes).title : file;

        if (innerData.id) {
          delete innerData.id;
        }

        try {
          await db.insert(table).values(innerData);
          console.log(`✅ Seeded: ${title}`);
        } catch (err) {
          console.error(`❌ Failed to seed ${title}:`, err);
        }
      });
    } else {
      const title = "title" in data ? (data as ContentTypes).title : file;
      if (data.id) {
        delete data.id;
      }
      try {
        await db.insert(table).values(data);
        console.log(`✅ Seeded: ${title}`);
      } catch (err) {
        console.error(`❌ Failed to seed ${title}:`, err);
      }
    }
  }
}

async function seed() {
  console.log("🌱 Seeding templates...");
  await seedFromFolder("data/templates", templates);

  console.log("🌱 Seeding pages...");
  await seedFromFolder("data/pages", pages);

  console.log("🌱 Seeding links...");
  await seedFromFolder("data/links", links);
  console.log(`✅ Seed Completed`);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
});
