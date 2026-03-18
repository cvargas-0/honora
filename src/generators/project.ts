import type { SchemaConfig } from "../core/schema-parser.js";
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

export function generateProject(
  schema: SchemaConfig,
  outputDir: string,
  schemaPath: string,
  lang: "ts" | "js",
): string[] {
  const files: string[] = [];
  const ext = lang === "ts" ? ".ts" : ".js";

  function write(relativePath: string, content: string) {
    writeFile(outputDir, relativePath, content);
    files.push(relativePath);
  }

  write("package.json", generatePackageJson(outputDir, lang));

  if (lang === "ts") {
    write("tsconfig.json", generateTsConfig());
  }

  write(`drizzle.config${ext}`, generateDrizzleConfig(schema.database, lang));
  write(`src/db/schema${ext}`, generateDbSchema(schema.collections, lang));
  write(`src/db/client${ext}`, generateDbClient(schema.database, lang));
  write(`src/utils/filter-parser${ext}`, generateFilterParser(lang));

  for (const collection of schema.collections) {
    write(`src/routes/${collection.name}${ext}`, generateRoute(collection, lang));
  }

  write(`src/routes/index${ext}`, generateRoutesIndex(schema, lang));
  write(`src/index${ext}`, generateEntry(lang));

  copyFile(schemaPath, outputDir, "schema.json");
  files.push("schema.json");

  return files;
}
