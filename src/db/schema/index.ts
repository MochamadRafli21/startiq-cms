import {
  mysqlTable,
  varchar,
  int,
  serial,
  boolean,
  timestamp,
  json,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
});

export const pages = mysqlTable("pages", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  tags: json("tags").default([]).notNull(),
  metaTitle: varchar("meta_title", { length: 255 }),
  metaDescription: varchar("meta_description", { length: 500 }),
  metaImage: varchar("meta_image", { length: 500 }),
  iconImage: varchar("icon_image", { length: 500 }),
  isPublic: boolean("is_public").default(false).notNull(),
  content: json("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const templates = mysqlTable("templates", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: json("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const links = mysqlTable("links", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  target: varchar("target", { length: 255 }).notNull(),
  descriptions: varchar("descriptions", { length: 500 }),
  banner: varchar("banner", { length: 500 }),
  tags: json("tags").default([]).notNull(),
  attributes: json("attributes").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
