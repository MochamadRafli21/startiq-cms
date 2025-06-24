const DOMAIN = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function GET() {
  const content = `
    User-agent: *
    Disallow: /api/
    Disallow: /admin/
    Allow: /
    
    Sitemap: ${DOMAIN}/sitemap.xml
  `.trim();

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
