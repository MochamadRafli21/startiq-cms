CREATE TABLE "forms" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"data" json NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "links" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"target" varchar(255) NOT NULL,
	"descriptions" varchar(500),
	"banner" varchar(500),
	"tags" json DEFAULT '[]'::json NOT NULL,
	"attributes" json DEFAULT '{}'::json NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"tags" json DEFAULT '[]'::json NOT NULL,
	"category" json DEFAULT '[]'::json NOT NULL,
	"meta_title" varchar(255),
	"meta_description" varchar(500),
	"meta_image" varchar(500),
	"icon_image" varchar(500),
	"is_public" boolean DEFAULT false NOT NULL,
	"content" json NOT NULL,
	"html" text,
	"css" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" json NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL
);
