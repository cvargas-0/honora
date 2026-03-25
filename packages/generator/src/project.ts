import { basename } from "node:path";
import type { SchemaConfig, GeneratorContext } from "@honora/types";
import { writeFile, copyFile } from "./writer.js";
import { getAdapter } from "./adapters/registry.js";
import { generatePackageJson } from "./shared/package-json.js";
import { generateTsConfig } from "./shared/tsconfig.js";
import { generateRoutesIndex } from "./shared/routes-index.js";
import { generateEntry } from "./shared/entry.js";

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
  const adapter = getAdapter(ctx.orm);

  function write(relativePath: string, content: string) {
    writeFile(outputDir, relativePath, content);
    files.push(relativePath);
  }

  write("package.json", generatePackageJson(outputDir, ctx, adapter.getDependencies(ctx)));

  if (lang === "ts") {
    write("tsconfig.json", generateTsConfig());
  }

  for (const f of adapter.generateConfig(schema.database, ctx)) {
    write(f.relativePath, f.content);
  }

  for (const f of adapter.generateSchema(schema.collections, ctx)) {
    write(f.relativePath, f.content);
  }

  for (const f of adapter.generateClient(schema.database, ctx)) {
    write(f.relativePath, f.content);
  }

  for (const f of adapter.generateFilterParser(ctx)) {
    write(f.relativePath, f.content);
  }

  for (const collection of schema.collections) {
    for (const f of adapter.generateRoute(collection, ctx)) {
      write(f.relativePath, f.content);
    }
  }

  write(`src/routes/index${ext}`, generateRoutesIndex(schema, ctx));
  write(`src/index${ext}`, generateEntry(ctx));

  copyFile(schemaPath, outputDir, "schema.json");
  files.push("schema.json");

  // .env — sensible defaults per driver
  const envLines: string[] = ["PORT=3000"];
  const defaultUrls: Record<string, string> = {
    sqlite: "./data.db",
    postgres: "postgresql://localhost:5432/" + basename(outputDir),
    mysql: "mysql://root@localhost:3306/" + basename(outputDir),
  };
  envLines.push(`DATABASE_URL=${defaultUrls[schema.database.driver] ?? "./data.db"}`);
  write(".env", envLines.join("\n") + "\n");

  return files;
}
