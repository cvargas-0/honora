import { z } from "zod";

/** Zod schema for a single field definition within a collection. */
export const fieldSchema = z.object({
  type: z.enum([
    "text",
    "number",
    "integer",
    "boolean",
    "date",
    "json",
    "relation",
  ]),
  required: z.boolean().optional().default(false),
  unique: z.boolean().optional().default(false),
  default: z.any().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  collection: z.string().optional(),
  onDelete: z
    .enum(["restrict", "cascade", "set_null"])
    .optional()
    .default("restrict"),
});

/** Zod schema for the id configuration of a collection. */
export const idSchema = z
  .object({
    type: z.enum(["uuid", "integer", "text"]).default("uuid"),
    autoincrement: z.boolean().optional().default(false),
  })
  .optional()
  .default({ type: "uuid", autoincrement: false });

/** Zod schema for a collection definition (name + fields map). */
export const collectionSchema = z.object({
  name: z.string().min(1),
  id: idSchema,
  fields: z.record(z.string(), fieldSchema),
});

/** Zod schema for the database connection configuration. */
export const databaseSchema = z.object({
  driver: z.enum(["sqlite", "postgres", "mysql"]).optional().default("sqlite"),
  url: z.string().optional().default("./data.db"),
  orm: z.enum(["drizzle", "prisma"]).optional().default("drizzle"),
});

/** Zod schema for the top-level schema.json configuration file. */
export const schemaConfigSchema = z.object({
  database: databaseSchema
    .optional()
    .default(() => ({ driver: "sqlite" as const, url: "./data.db", orm: "drizzle" as const })),
  middleware: z
    .array(z.enum(["cors", "logger"]))
    .optional()
    .default([]),
  validation: z.enum(["manual", "hono-zod"]).optional().default("manual"),
  openapi: z.boolean().optional().default(false),
  collections: z.array(collectionSchema).min(1),
});
