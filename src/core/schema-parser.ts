import { z } from "zod";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/** Zod schema for a single field definition within a collection. */
const fieldSchema = z.object({
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
const idSchema = z
  .object({
    type: z.enum(["uuid", "integer", "text"]).default("uuid"),
    autoincrement: z.boolean().optional().default(false),
  })
  .optional()
  .default({ type: "uuid", autoincrement: false });

/** Zod schema for a collection definition (name + fields map). */
const collectionSchema = z.object({
  name: z.string().min(1),
  id: idSchema,
  fields: z.record(z.string(), fieldSchema),
});

/** Zod schema for the database connection configuration. */
const databaseSchema = z.object({
  driver: z.enum(["sqlite", "postgres", "mysql"]).optional().default("sqlite"),
  url: z.string().optional().default("./data.db"),
});

/** Zod schema for the top-level schema.json configuration file. */
const schemaConfigSchema = z.object({
  database: databaseSchema
    .optional()
    .default(() => ({ driver: "sqlite" as const, url: "./data.db" })),
  middleware: z
    .array(z.enum(["cors", "logger"]))
    .optional()
    .default([]),
  validation: z.enum(["manual", "hono-zod"]).optional().default("manual"),
  openapi: z.boolean().optional().default(false),
  collections: z.array(collectionSchema).min(1),
});

/** Id configuration for a collection. */
export type IdConfig = z.infer<typeof idSchema>;

/** A single field definition inferred from the Zod field schema. */
export type Field = z.infer<typeof fieldSchema>;

/** A collection definition containing a name and a map of field definitions. */
export type Collection = z.infer<typeof collectionSchema>;

/** Database connection configuration (driver + connection URL). */
export type DatabaseConfig = z.infer<typeof databaseSchema>;

/** Top-level schema configuration containing database settings and collections. */
export type SchemaConfig = z.infer<typeof schemaConfigSchema>;

/**
 * Loads and validates a schema.json file from disk.
 * @param path - Relative or absolute path to the schema JSON file.
 * @returns The parsed and validated schema configuration.
 * @throws If the file cannot be read or fails Zod validation.
 */
export function loadSchema(path: string): SchemaConfig {
  const absPath = resolve(path);
  const raw = readFileSync(absPath, "utf-8");
  const json = JSON.parse(raw);
  return schemaConfigSchema.parse(json);
}
