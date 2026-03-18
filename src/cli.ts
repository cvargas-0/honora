import { existsSync } from "node:fs";
import { resolve } from "node:path";
import * as p from "@clack/prompts";
import { loadSchema } from "./core/schema-parser.js";
import { generateProject } from "./generators/project.js";

async function main() {
  p.intro("blynt v0.1.0");

  const args = process.argv.slice(2);
  const flagIndex = (name: string) => {
    const i = args.indexOf(`--${name}`);
    return i !== -1 && args[i + 1] ? args[i + 1] : undefined;
  };
  const hasFlag = (name: string) => args.includes(`--${name}`);

  const isNonInteractive = hasFlag("yes") || !process.stdin.isTTY;

  let schemaPath = flagIndex("schema") ?? flagIndex("schema-path");
  let outputDir = flagIndex("output");
  let lang = flagIndex("lang") as "ts" | "js" | undefined;
  let force = hasFlag("force");

  if (isNonInteractive) {
    schemaPath ??= "./schema.json";
    outputDir ??= "./output";
    lang ??= "ts";
  } else {
    const options = await p.group(
      {
        schemaPath: () =>
          p.text({
            message: "Path to schema file",
            initialValue: schemaPath ?? "./schema.json",
            validate: (val) => {
              if (!val) return "Schema path is required";
              if (!existsSync(resolve(val))) return `File not found: ${val}`;
            },
          }),
        outputDir: () =>
          p.text({
            message: "Output directory",
            initialValue: outputDir ?? "./output",
            validate: (val) => {
              if (!val) return "Output directory is required";
            },
          }),
        lang: () =>
          p.select({
            message: "Language",
            initialValue: lang ?? "ts",
            options: [
              { value: "ts", label: "TypeScript" },
              { value: "js", label: "JavaScript" },
            ],
          }),
      },
      {
        onCancel: () => {
          p.cancel("Cancelled.");
          process.exit(0);
        },
      },
    );

    schemaPath = options.schemaPath;
    outputDir = options.outputDir;
    lang = options.lang as "ts" | "js";
  }

  const absSchemaPath = resolve(schemaPath);
  const absOutputDir = resolve(outputDir);

  if (!existsSync(absSchemaPath)) {
    p.cancel(`Schema file not found: ${absSchemaPath}`);
    process.exit(1);
  }

  if (existsSync(absOutputDir) && !force) {
    if (isNonInteractive) {
      p.cancel(`Output directory already exists: ${absOutputDir}. Use --force to overwrite.`);
      process.exit(1);
    }
    const overwrite = await p.confirm({
      message: `Output directory already exists. Overwrite?`,
      initialValue: false,
    });
    if (p.isCancel(overwrite) || !overwrite) {
      p.cancel("Cancelled.");
      process.exit(0);
    }
  }

  let schema;
  try {
    schema = loadSchema(absSchemaPath);
  } catch (err: any) {
    p.cancel(`Failed to load schema: ${err.message}`);
    process.exit(1);
  }

  p.log.info(`Schema loaded: ${schema.collections.length} collection(s)`);
  for (const col of schema.collections) {
    p.log.step(`  ${col.name} (${Object.keys(col.fields).length} fields)`);
  }

  const s = p.spinner();
  s.start("Generating project...");

  const files = generateProject(schema, absOutputDir, absSchemaPath, lang);

  s.stop(`Project generated — ${files.length} files created`);

  p.note(files.map((f) => `  ${f}`).join("\n"), absOutputDir);

  p.log.info("Next steps:");
  p.log.step(`  cd ${outputDir}`);
  p.log.step("  npm install");
  p.log.step("  npm run dev");

  p.outro("Done!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
