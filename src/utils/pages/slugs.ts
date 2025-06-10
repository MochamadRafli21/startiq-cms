const reservedSlugs = ["admin", "login"];

export function validateSlug(input: string): string | null {
  const slug = input.trim().toLowerCase();

  // check if slug is on root
  if (slug === "*") return null;

  // Check if slug is URL-safe
  const validSlug = /^[a-z0-9\-\/]+$/.test(slug);
  if (!validSlug)
    return "Slug can only contain lowercase letters, numbers, hyphens, and slashes.";

  // Check for leading/trailing slashes
  if (slug.startsWith("/") || slug.endsWith("/")) {
    return "Slug should not start or end with a slash.";
  }

  // Check if it's reserved
  const parts = slug.split("/");
  if (parts.some((part) => reservedSlugs.includes(part))) {
    return `Slug cannot contain reserved path like /${reservedSlugs.join(", /")}`;
  }

  return null;
}

export async function validateSlugViaApi(slug: string, pageId?: number) {
  const res = await fetch("/api/pages/validate-slug", {
    method: "POST",
    body: JSON.stringify({ slug, pageId }),
    headers: { "Content-Type": "application/json" },
  });

  return res.json() as Promise<{ valid: boolean; error?: string }>;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s/-]/g, "") // remove non-word chars
    .replace(/\s+/g, "-"); // replace spaces with hyphens
}
