import { defineCommand, runMain } from "citty";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadSchema } from "./core/schema-parser.js";
import { generateProject } from "./generators/project.js";

const init = defineCommand({
  meta: {
    name: "init",
    description: "Generate a REST API project from a schema.json file",
  },
  args: {
    "schema-path": {
      type: "string",
      description: "Path to schema file",
      default: "./schema.json",
    },
    output: {
      type: "string",
      description: "Output directory",
      default: "./output",
    },
    lang: {
      type: "string",
      description: "Output language: ts or js",
      default: "ts",
    },
    force: {
      type: "boolean",
      description: "Overwrite existing output directory",
      default: false,
    },
  },
  run({ args }) {
    const schemaPath = resolve(args["schema-path"]);
    const outputDir = resolve(args.output);
    const lang = args.lang as "ts" | "js";

    if (lang !== "ts" && lang !== "js") {
      console.error(`Invalid language: "${lang}". Use "ts" or "js".`);
      process.exit(1);
    }

    console.log("blynt v0.1.0\n");

    if (!existsSync(schemaPath)) {
      console.error(`Schema file not found: ${schemaPath}`);
      process.exit(1);
    }

    if (existsSync(outputDir) && !args.force) {
      console.error(`Output directory already exists: ${outputDir}`);
      console.error('Use --force to overwrite.');
      process.exit(1);
    }

    let schema;
    try {
      schema = loadSchema(schemaPath);
    } catch (err: any) {
      console.error(`Failed to load schema: ${err.message}`);
      process.exit(1);
    }

    console.log(`Schema loaded: ${schema.collections.length} collection(s)`);
    for (const col of schema.collections) {
      console.log(`  - ${col.name} (${Object.keys(col.fields).length} fields)`);
    }
    console.log(`\nLanguage: ${lang.toUpperCase()}\n`);

    const files = generateProject(schema, outputDir, schemaPath, lang);

    console.log(`Project generated at ${outputDir}/`);
    console.log(`${files.length} files created:\n`);
    for (const file of files) {
      console.log(`  ${file}`);
    }

    console.log("\nNext steps:");
    console.log(`  cd ${args.output}`);
    console.log("  npm install");
    console.log("  npm run dev");
    console.log("");
  },
});

const main = defineCommand({
  meta: {
    name: "blynt",
    version: "0.1.0",
    description: "Generate a REST API project from a JSON schema.",
  },
  subCommands: {
    init,
  },
});

runMain(main);
