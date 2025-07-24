import {
  pgTable,
  varchar,
  integer,
  boolean,
  timestamp,
  json,
  text,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
});

export const pages = pgTable("pages", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  tags: json("tags").default([]).notNull(),
  category: json("category").default([]).notNull(),
  meta_title: varchar("meta_title", { length: 255 }),
  meta_description: varchar("meta_description", { length: 500 }),
  meta_image: varchar("meta_image", { length: 500 }),
  icon_image: varchar("icon_image", { length: 500 }),
  is_public: boolean("is_public").default(false).notNull(),
  content: json("content").notNull(),
  html: text("html"),
  css: text("css"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const templates = pgTable("templates", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: varchar("title", { length: 255 }).notNull(),
  content: json("content").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const links = pgTable("links", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: varchar("title", { length: 255 }).notNull(),
  target: varchar("target", { length: 255 }).notNull(),
  descriptions: varchar("descriptions", { length: 500 }),
  banner: varchar("banner", { length: 500 }),
  tags: json("tags").default([]).notNull(),
  attributes: json("attributes").default({}).notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const forms = pgTable("forms", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }),
  data: json("data").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});
