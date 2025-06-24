import { db } from "@/db/client";
import { exec } from "child_process";
import { domains } from "@/db/schema";
import { or, and, count, like, sql, eq } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";
import { requireSession } from "@/lib/guard";

export async function GET(req: Request) {
  const { error } = await requireSession();
  if (error) return new Response("Unauthorized", { status: 401 });

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

const APACHE_AVAILABLE =
  process.env.APACHE_AVAILABLE ?? "/etc/apache2/sites-available";
const SERVER_PORT = process.env.SERVER_PORT ?? "3000";
const SERVER_IP = process.env.SERVER_IP;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

const runCommand = (cmd: string) =>
  new Promise<void>((resolve, reject) => {
    exec(cmd, (err, _stdout, stderr) => {
      if (err) return reject(stderr || err.message);
      resolve();
    });
  });

export async function POST(req: Request) {
  const { error } = await requireSession();
  if (error) return new Response("Unauthorized", { status: 401 });
  if (!APACHE_AVAILABLE || !SERVER_IP)
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
    const configPath = path.join(APACHE_AVAILABLE, domain.domain);

    const configContent = `
      <VirtualHost *:80>
          ServerName ${domain.domain}
          ServerAlias www.${domain.domain}
      
          ProxyPreserveHost On
          ProxyPass / http://localhost:${SERVER_PORT}/
          ProxyPassReverse / http://localhost:${SERVER_PORT}/
      
          ErrorLog \${APACHE_LOG_DIR}/${domain.domain}_error.log
          CustomLog \${APACHE_LOG_DIR}/${domain.domain}_access.log combined
      </VirtualHost>
    `;

    await fs.writeFile(configPath, configContent, { mode: 0o644 });
    await runCommand(`a2ensite ${domain.domain}.conf`);
    await runCommand(`sudo systemctl reload apache2`);

    // TODO skip certbot on dev
    await runCommand(
      `certbot --apache -d ${domain.domain} -d www.${domain.domain} --non-interactive --agree-tos -m ${ADMIN_EMAIL}`,
    );

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
