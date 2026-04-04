export type FieldType = "text" | "integer" | "boolean" | "relation";

export interface SchemaField {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  unique: boolean;
  relationCollection?: string;
}

export interface Collection {
  id: string;
  name: string;
  methods: string[];
  fields: SchemaField[];
}

export interface DatabaseConfig {
  driver: "sqlite" | "postgres" | "mysql" | "";
  url: string;
}

export interface OpenAPIConfig {
  enabled: boolean;
}

export interface SchemaConfig {
  projectName: string;
  database: DatabaseConfig;
  middleware: string[];
  openapi: OpenAPIConfig;
  collections: Collection[];
}

export const METHOD_OPTIONS = [
  "get",
  "getId",
  "post",
  "put",
  "patch",
  "delete",
  "options",
] as const;

export const FIELD_TYPES: FieldType[] = [
  "text",
  "integer",
  "boolean",
  "relation",
];

export const DRIVER_OPTIONS = ["sqlite", "postgres", "mysql"] as const;

export const MIDDLEWARE_OPTIONS = ["cors", "logger"] as const;

export function schemaToJSON(config: SchemaConfig): object {
  const result: Record<string, unknown> = {};

  if (config.database.driver || config.database.url) {
    result.database = {
      ...(config.database.driver && { driver: config.database.driver }),
      ...(config.database.url && { url: config.database.url }),
    };
  }

  if (config.middleware.length > 0) {
    result.middleware = config.middleware;
  }

  if (config.openapi.enabled) {
    result.openapi = true;
  }

  if (config.collections.length > 0) {
    result.collections = config.collections
      .filter((c) => c.name.trim())
      .map((collection) => {
        const col: Record<string, unknown> = {
          name: collection.name,
        };

        if (collection.methods.length > 0) {
          col.methods = collection.methods;
        }

        const fields = collection.fields
          .filter((f) => f.name.trim())
          .map((field) => {
            const f: Record<string, unknown> = {
              name: field.name,
              type: field.type,
            };

            if (field.required) f.required = true;
            if (field.unique) f.unique = true;
            if (field.type === "relation" && field.relationCollection) {
              f.collection = field.relationCollection;
            }

            return f;
          });

        if (fields.length > 0) {
          col.fields = fields;
        }

        return col;
      });
  }

  return result;
}

export function validateSchema(config: SchemaConfig): string[] {
  const errors: string[] = [];

  if (config.collections.length === 0) {
    errors.push("Add at least one collection to generate a schema");
  }

  config.collections.forEach((collection, index) => {
    if (!collection.name.trim()) {
      errors.push(`Collection ${index + 1} needs a name`);
    }
  });

  return errors;
}
