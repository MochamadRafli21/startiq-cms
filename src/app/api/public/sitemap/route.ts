import { db } from "@/db/client"; // replace with your actual db import
import { pages } from "@/db/schema";
import { eq } from "drizzle-orm";

const DOMAIN = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function GET() {
  const publicPages = await db
    .select({
      slug: pages.slug,
      updatedAt: pages.updatedAt,
    })
    .from(pages)
    .where(eq(pages.isPublic, true));

  const urls = publicPages.map((page) => {
    return `
  <url>
    <loc>${DOMAIN}/${page.slug}</loc>
    <lastmod>${page.updatedAt?.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`.trim();

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
