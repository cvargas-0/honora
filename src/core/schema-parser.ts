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

/** Result of loading a schema, including which keys were explicitly set. */
export interface LoadedSchema {
  config: SchemaConfig;
  explicitKeys: Set<string>;
  explicitDbKeys: Set<string>;
}

/**
 * Loads and validates a schema.json file from disk.
 * Returns the validated config plus sets of explicitly provided keys,
 * so the CLI can distinguish user-defined values from Zod defaults.
 */
export function loadSchema(path: string): LoadedSchema {
  const absPath = resolve(path);
  const raw = readFileSync(absPath, "utf-8");
  const json = JSON.parse(raw);
  const explicitKeys = new Set<string>(Object.keys(json));
  const explicitDbKeys = new Set<string>(Object.keys(json.database ?? {}));
  const config = schemaConfigSchema.parse(json);
  return { config, explicitKeys, explicitDbKeys };
}
