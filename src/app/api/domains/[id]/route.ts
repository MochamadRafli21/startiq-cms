import { db } from "@/db/client";
import { domains } from "@/db/schema";
import { eq } from "drizzle-orm";
import fs from "fs/promises";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { requireSession } from "@/lib/guard";

const run = promisify(exec);

const NGINX_AVAILABLE = process.env.NGINX_AVAILABLE;
const NGINX_ENABLED = process.env.NGINX_ENABLED;

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireSession();
  if (error) return new Response("Unauthorized", { status: 401 });

  if (!NGINX_AVAILABLE || !NGINX_ENABLED)
    return new Response(
      JSON.stringify({ error: "Custom Domain Is Not Configure Yet" }),
      {
        status: 400,
      },
    );

  const { id } = await params;

  // Fetch domain first
  const [domain] = await db
    .select({ domain: domains.domain })
    .from(domains)
    .where(eq(domains.id, Number(id)))
    .limit(1);

  if (!domain) {
    return new Response("Domain not found", { status: 404 });
  }

  const domainName = domain.domain;

  const configPath = path.join(NGINX_AVAILABLE, domainName);
  const symlinkPath = path.join(NGINX_ENABLED, domainName);
  try {
    // Remove Nginx config and symlink
    await fs.rm(configPath, { force: true });
    await fs.rm(symlinkPath, { force: true });

    // Reload Nginx
    await run("sudo nginx -t && sudo systemctl reload nginx");

    // Optional: delete SSL certificate
    await run(`sudo certbot delete --cert-name ${domainName}`);
  } catch (err) {
    console.error("Error cleaning up domain:", err);
    return new Response("Error cleaning up domain", { status: 500 });
  }

  // Remove from DB
  await db.delete(domains).where(eq(domains.id, Number(id)));

  return Response.json({ success: true });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireSession();
  if (error) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const body = await req.json();

  await db
    .update(domains)
    .set({
      defaultPageId: body.defaultPageId || null,
    })
    .where(eq(domains.id, Number(id)));

  const [domain] = await db
    .select()
    .from(domains)
    .where(eq(domains.id, Number(id)))
    .limit(1);

  return Response.json(domain);
}
