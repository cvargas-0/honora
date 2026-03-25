import type { OrmAdapter, GeneratedFile, AdapterDependencies, Collection, DatabaseConfig, GeneratorContext } from "@honora/types";
import { generateDbSchema } from "./db-schema";
import { generateDbClient } from "./db-client";
import { generateDrizzleConfig } from "./drizzle-config";
import { generateFilterParser } from "./filter-parser";
import { generateRoute } from "./routes";

function drizzleDriverDeps(driver: GeneratorContext["driver"]): {
  deps: Record<string, string>;
  devDeps: Record<string, string>;
} {
  if (driver === "postgres") {
    return {
      deps: { pg: "^8.16.3" },
      devDeps: { "@types/pg": "^8.16.0" },
    };
  }
  if (driver === "mysql") {
    return {
      deps: { mysql2: "^3.14.0" },
      devDeps: {},
    };
  }
  return {
    deps: { "better-sqlite3": "^12.8.0" },
    devDeps: { "@types/better-sqlite3": "^7.6.13" },
  };
}

export const drizzleAdapter: OrmAdapter = {
  name: "drizzle",

  generateSchema(collections: Collection[], ctx: GeneratorContext): GeneratedFile[] {
    const ext = ctx.lang === "ts" ? ".ts" : ".js";
    return [{ relativePath: `src/db/schema${ext}`, content: generateDbSchema(collections, ctx) }];
  },

  generateClient(database: DatabaseConfig, ctx: GeneratorContext): GeneratedFile[] {
    const ext = ctx.lang === "ts" ? ".ts" : ".js";
    return [{ relativePath: `src/db/client${ext}`, content: generateDbClient(database, ctx) }];
  },

  generateFilterParser(ctx: GeneratorContext): GeneratedFile[] {
    const ext = ctx.lang === "ts" ? ".ts" : ".js";
    return [{ relativePath: `src/utils/filter-parser${ext}`, content: generateFilterParser(ctx) }];
  },

  generateRoute(collection: Collection, ctx: GeneratorContext): GeneratedFile[] {
    const ext = ctx.lang === "ts" ? ".ts" : ".js";
    return [{ relativePath: `src/routes/${collection.name}${ext}`, content: generateRoute(collection, ctx) }];
  },

  generateConfig(database: DatabaseConfig, ctx: GeneratorContext): GeneratedFile[] {
    const ext = ctx.lang === "ts" ? ".ts" : ".js";
    return [{ relativePath: `drizzle.config${ext}`, content: generateDrizzleConfig(database, ctx) }];
  },

  getDependencies(ctx: GeneratorContext): AdapterDependencies {
    const db = drizzleDriverDeps(ctx.driver);
    return {
      dependencies: {
        "drizzle-orm": "^0.45.1",
        ...db.deps,
      },
      devDependencies: {
        "drizzle-kit": "^0.31.10",
        ...db.devDeps,
      },
      scripts: {
        "db:generate": "drizzle-kit generate",
        "db:migrate": "drizzle-kit migrate",
        "db:push": "drizzle-kit push",
        "db:studio": "drizzle-kit studio",
      },
    };
  },
};
