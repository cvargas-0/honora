import type { SchemaConfig } from "../core/schema-parser.js";
import type { GeneratorContext } from "../core/context.js";
import { writeFile, copyFile } from "../utils/writer.js";
import { generatePackageJson } from "./package-json.js";
import { generateTsConfig } from "./tsconfig.js";
import { generateDrizzleConfig } from "./drizzle-config.js";
import { generateDbSchema } from "./db-schema.js";
import { generateDbClient } from "./db-client.js";
import { generateFilterParser } from "./filter-parser.js";
import { generateRoute } from "./routes.js";
import { generateRoutesIndex } from "./routes-index.js";
import { generateEntry } from "./entry.js";
import { generatePrismaSchema } from "./prisma-schema.js";
import { generatePrismaClient } from "./prisma-client.js";
import { generatePrismaFilterParser } from "./prisma-filter-parser.js";
import { generatePrismaRoute } from "./prisma-routes.js";

export function generateProject(
  schema: SchemaConfig,
  outputDir: string,
  schemaPath: string,
  lang: "ts" | "js",
): string[] {
  const ctx: GeneratorContext = {
    lang,
    driver: schema.database.driver,
    orm: schema.database.orm,
    middleware: schema.middleware,
    validation: schema.openapi ? "hono-zod" : schema.validation,
    openapi: schema.openapi,
  };

  const files: string[] = [];
  const ext = lang === "ts" ? ".ts" : ".js";
  const isPrisma = ctx.orm === "prisma";

  function write(relativePath: string, content: string) {
    writeFile(outputDir, relativePath, content);
    files.push(relativePath);
  }

  write("package.json", generatePackageJson(outputDir, ctx));

  if (lang === "ts") {
    write("tsconfig.json", generateTsConfig());
  }

  if (isPrisma) {
    write("prisma/schema.prisma", generatePrismaSchema(schema.collections, ctx));
    write(`src/db/client${ext}`, generatePrismaClient(ctx));
    write(`src/utils/filter-parser${ext}`, generatePrismaFilterParser(ctx));
  } else {
    write(`drizzle.config${ext}`, generateDrizzleConfig(schema.database, ctx));
    write(`src/db/schema${ext}`, generateDbSchema(schema.collections, ctx));
    write(`src/db/client${ext}`, generateDbClient(schema.database, ctx));
    write(`src/utils/filter-parser${ext}`, generateFilterParser(ctx));
  }

  for (const collection of schema.collections) {
    const routeGen = isPrisma ? generatePrismaRoute : generateRoute;
    write(
      `src/routes/${collection.name}${ext}`,
      routeGen(collection, ctx),
    );
  }

  write(`src/routes/index${ext}`, generateRoutesIndex(schema, ctx));
  write(`src/index${ext}`, generateEntry(ctx));

  copyFile(schemaPath, outputDir, "schema.json");
  files.push("schema.json");

  return files;
}
