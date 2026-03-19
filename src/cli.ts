import { existsSync } from "node:fs";
import { basename, resolve } from "node:path";
import * as p from "@clack/prompts";
import { loadSchema } from "./core/schema-parser.js";
import { generateProject } from "./generators/project.js";

const VERSION = "0.1.0";

const HELP = `
honora v${VERSION}

Usage: honora <name> [options]

Arguments:
  <name>              Project name or "." for current directory

Options:
  --schema <path>     Path to schema file (default: ./schema.json)
  --lang <ts|js>      Output language (default: ts)
  --force             Overwrite existing directory
  --yes               Skip prompts, use defaults
  --help              Show this help message
  --version           Show version number
`.trim();

const VALID_NAME = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

function validateProjectName(name: string | undefined): string | undefined {
  if (!name || name.trim() === "") return "Project name is required";
  if (name === ".") return undefined;
  if (!VALID_NAME.test(name)) return "Invalid project name (use lowercase, hyphens, no spaces)";
}

async function main() {
  const args = process.argv.slice(2);
  const flagValue = (name: string) => {
    const i = args.indexOf(`--${name}`);
    return i !== -1 && args[i + 1] ? args[i + 1] : undefined;
  };
  const hasFlag = (name: string) => args.includes(`--${name}`);

  if (hasFlag("help") || hasFlag("h")) {
    console.log(HELP);
    process.exit(0);
  }

  if (hasFlag("version") || hasFlag("v")) {
    console.log(VERSION);
    process.exit(0);
  }

  p.intro(`honora v${VERSION}`);

  // Positional: honora my-api  or  honora .
  const positional = args.find((a: string) => !a.startsWith("--"));

  const isNonInteractive = hasFlag("yes") || !process.stdin.isTTY;

  let projectName = positional ?? flagValue("name");
  let schemaPath = flagValue("schema");
  let lang = flagValue("lang") as "ts" | "js" | undefined;
  const force = hasFlag("force");

  if (isNonInteractive) {
    if (!projectName) {
      p.cancel("Project name is required. Usage: honora <name> or honora .");
      process.exit(1);
    }
    const nameErr = validateProjectName(projectName);
    if (nameErr) {
      p.cancel(nameErr);
      process.exit(1);
    }
    schemaPath ??= "./schema.json";
    lang ??= "ts";
  } else {
    const options = await p.group(
      {
        projectName: () =>
          p.text({
            message: "Project name",
            initialValue: projectName,
            placeholder: "my-api",
            validate: validateProjectName,
          }),
        schemaPath: () =>
          p.text({
            message: "Path to schema file",
            initialValue: schemaPath ?? "./schema.json",
            validate: (val) => {
              if (!val) return "Schema path is required";
              if (!existsSync(resolve(val))) return `File not found: ${val}`;
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

    projectName = options.projectName;
    schemaPath = options.schemaPath;
    lang = options.lang as "ts" | "js";
  }

  const isCwd = projectName === ".";
  const outputDir = isCwd ? process.cwd() : resolve(projectName);
  const displayName = isCwd ? basename(process.cwd()) : projectName;

  const absSchemaPath = resolve(schemaPath);

  if (!existsSync(absSchemaPath)) {
    p.cancel(`Schema file not found: ${absSchemaPath}`);
    process.exit(1);
  }

  if (!isCwd && existsSync(outputDir) && !force) {
    if (isNonInteractive) {
      p.cancel(
        `Directory "${projectName}" already exists. Use --force to overwrite.`,
      );
      process.exit(1);
    }
    const overwrite = await p.confirm({
      message: `Directory "${projectName}" already exists. Overwrite?`,
      initialValue: false,
    });
    if (p.isCancel(overwrite) || !overwrite) {
      p.cancel("Cancelled.");
      process.exit(0);
    }
  }

  const schema = (() => {
    try {
      return loadSchema(absSchemaPath);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      p.cancel(`Failed to load schema: ${msg}`);
      return process.exit(1) as never;
    }
  })();

  p.log.info(
    `Creating ${displayName} — ${schema.collections.length} collection(s)`,
  );
  for (const col of schema.collections) {
    p.log.step(`  ${col.name} (${Object.keys(col.fields).length} fields)`);
  }

  const s = p.spinner();
  s.start("Generating project...");

  const files = generateProject(schema, outputDir, absSchemaPath, lang);

  s.stop(`${files.length} files created`);

  p.note(files.map((f) => `  ${f}`).join("\n"), outputDir);

  if (isCwd) {
    p.log.info("Next steps:");
    p.log.step("  npm install");
    p.log.step("  npm run dev");
  } else {
    p.log.info("Next steps:");
    p.log.step(`  cd ${projectName}`);
    p.log.step("  npm install");
    p.log.step("  npm run dev");
  }

  p.outro("Done!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
