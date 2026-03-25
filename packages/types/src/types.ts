import { z } from "zod";
import {
  fieldSchema,
  idSchema,
  collectionSchema,
  databaseSchema,
  schemaConfigSchema,
} from "./schemas.js";

/** A single field definition inferred from the Zod field schema. */
export type Field = z.infer<typeof fieldSchema>;

/** Id configuration for a collection. */
export type IdConfig = z.infer<typeof idSchema>;

/** A collection definition containing a name and a map of field definitions. */
export type Collection = z.infer<typeof collectionSchema>;

/** Database connection configuration (driver + connection URL + ORM). */
export type DatabaseConfig = z.infer<typeof databaseSchema>;

/** Top-level schema configuration containing database settings and collections. */
export type SchemaConfig = z.infer<typeof schemaConfigSchema>;

/** Result of loading a schema, including which keys were explicitly set. */
export interface LoadedSchema {
  config: SchemaConfig;
  explicitKeys: Set<string>;
  explicitDbKeys: Set<string>;
}

/** Central configuration object passed to all generators. */
export interface GeneratorContext {
  lang: "ts" | "js";
  driver: "sqlite" | "postgres" | "mysql";
  orm: "drizzle" | "prisma";
  middleware: string[];
  validation: "manual" | "hono-zod";
  openapi: boolean;
}
