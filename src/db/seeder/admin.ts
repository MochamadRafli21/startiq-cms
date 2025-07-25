import { db } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const plainPassword = process.env.ADMIN_PASSWORD;
  if (!email || !plainPassword) {
    console.error("❌ Missing ADMIN_EMAIL or ADMIN_PASSWORD in .env file.");
    process.exit(1);
  }
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (existingUser) {
    console.log("Admin user already exists.");
    return;
  }

  await db.insert(users).values({
    name: "Admin",
    email,
    password: hashedPassword,
  });

  console.log("✅ Admin user created:", email);
}

seedAdmin().catch((err) => {
  console.error("❌ Failed to seed admin user:", err);
});
