import { db } from "@/db/client";
import { exec } from "child_process";
import { domains } from "@/db/schema";
import { or, and, count, like, sql, eq } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";

export async function GET(req: Request) {
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
}

const NGINX_AVAILABLE = "/etc/nginx/sites-available";
const NGINX_ENABLED = "/etc/nginx/sites-enabled";

const runCommand = (cmd: string) =>
  new Promise<void>((resolve, reject) => {
    exec(cmd, (err, _stdout, stderr) => {
      if (err) return reject(stderr || err.message);
      resolve();
    });
  });

export async function POST(req: Request) {
  const body = await req.json();
  const [{ id }] = await db
    .insert(domains)
    .values({
      domain: body.domain,
      defaultPageId: body.defaultPageId,
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
          proxy_pass http://localhost:3000;
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
    await runCommand(`nginx -t`);
    await runCommand(`sudo systemctl reload nginx`);

    await db
      .update(domains)
      .set({
        verified: true,
      })
      .where(eq(domains.domain, domain.domain));
  } catch (err) {
    console.error("Register failed", err);
  }

  return Response.json(domain);
}
