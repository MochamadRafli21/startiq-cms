import { db } from "@/db/client";
import { exec } from "child_process";
import { domains } from "@/db/schema";
import { or, and, count, like, sql, eq } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "10");
    const offset = (page - 1) * limit;

    const whereConditions = [];

    if (search) {
      const searchLower = search.toLowerCase();
      whereConditions.push(
        and(or(like(sql`LOWER(${domains.domain})`, `%${searchLower}%`))),
      );
    }

    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const [totalResult] = await db
      .select({ count: count() })
      .from(domains)
      .where(whereClause);

    const results = await db
      .select({
        id: domains.id,
        domain: domains.domain,
        verified: domains.verified,
        defaultPageId: domains.defaultPageId,
      })
      .from(domains)
      .where(whereClause)
      .limit(limit)
      .offset(offset);

    return Response.json({
      domains: results,
      total: Number(totalResult.count),
    });
  } catch (error) {
    console.error(error);
  }
}

const NGINX_AVAILABLE = process.env.NGINX_AVAILABLE;
const NGINX_ENABLED = process.env.NGINX_ENABLED;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

const runCommand = (cmd: string) =>
  new Promise<void>((resolve, reject) => {
    exec(cmd, (err, _stdout, stderr) => {
      if (err) return reject(stderr || err.message);
      resolve();
    });
  });

export async function POST(req: Request) {
  if (!NGINX_AVAILABLE || !NGINX_ENABLED)
    return new Response(
      JSON.stringify({ error: "Custom Domain Is Not Configure Yet" }),
      {
        status: 400,
      },
    );

  const body = await req.json();
  const [{ id }] = await db
    .insert(domains)
    .values({
      domain: body.domain,
      defaultPageId: body.defaultPageId || null,
      isPrimary: body.isPrimary,
    })
    .$returningId();

  const [domain] = await db
    .select()
    .from(domains)
    .where(eq(domains.id, id))
    .limit(1);

  // Try to register (optional: wrap in try/catch and update status)
  try {
    const configPath = path.join(NGINX_AVAILABLE, domain.domain);
    const symlinkPath = path.join(NGINX_ENABLED, domain.domain);

    const configContent = `
      server {
        listen 80;
        server_name ${domain.domain};
      
        location / {
          proxy_pass ${process.env.SERVER_IP};
          proxy_http_version 1.1;
          proxy_set_header Upgrade $http_upgrade;
          proxy_set_header Connection 'upgrade';
          proxy_set_header Host $host;
          proxy_cache_bypass $http_upgrade;
        }
      }
      `;

    await fs.writeFile(configPath, configContent, { mode: 0o644 });
    await runCommand(`ln -sfn ${configPath} ${symlinkPath}`);
    // TODO skip certbot on dev
    await runCommand(
      `certbot --nginx -d ${domain.domain} --non-interactive --agree-tos -m ${ADMIN_EMAIL}`,
    );
    await runCommand(`nginx -t`);
    await runCommand(`sudo systemctl reload nginx`);

    await db
      .update(domains)
      .set({
        verified: true,
      })
      .where(eq(domains.domain, domain.domain));

    return Response.json(domain);
  } catch (err) {
    console.error("Register failed", err);
    if (err) return new Response("Failed to register domain", { status: 400 });
  }
}
