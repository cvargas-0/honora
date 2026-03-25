import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { basename, resolve } from "node:path";
import * as p from "@clack/prompts";
import { loadSchema, generateProject } from "@honora/generator";
import type { DatabaseConfig, GeneratorContext } from "@honora/types";
import pkg from "../package.json";

const VERSION = pkg.version;

const HELP = `
honora v${VERSION}

Usage: honora <name> [options]

Arguments:
  <name>              Project name or "." for current directory

Options:
  --schema <path>     Path to schema file (default: ./schema.json)
  --lang <ts|js>      Output language (default: ts)
  --driver <driver>   Database driver: sqlite, postgres, mysql
  --orm <orm>         ORM: drizzle, prisma
  --middleware <list>  Comma-separated: cors,logger
  --validation <mode> Validation mode: manual, hono-zod
  --openapi           Enable OpenAPI docs with Scalar
  --force             Overwrite existing directory
  --git               Initialize git repository (default with --yes)
  --no-git            Skip git initialization
  --install           Install dependencies (default with --yes)
  --no-install        Skip dependency installation
  --pkg-manager <pm>  Package manager: npm, pnpm, yarn, bun
  --yes               Skip prompts, use defaults
  --help              Show this help message
  --version           Show version number
`.trim();

function detectPackageManager(): string {
  const agent = process.env.npm_config_user_agent ?? "";
  if (agent.includes("pnpm/")) return "pnpm";
  if (agent.includes("yarn/")) return "yarn";
  if (agent.includes("bun/")) return "bun";
  return "npm";
}

const VALID_NAME = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

type Driver = DatabaseConfig["driver"];
type Orm = DatabaseConfig["orm"];
type Validation = GeneratorContext["validation"];
const VALID_MIDDLEWARE = ["cors", "logger"] as const;

function validateProjectName(name: string | undefined): string | undefined {
  if (!name || name.trim() === "") return "Project name is required";
  if (name === ".") return undefined;
  if (!VALID_NAME.test(name))
    return "Invalid project name (use lowercase, hyphens, no spaces)";
}

function cancelled(): never {
  p.cancel("Cancelled.");
  return process.exit(0) as never;
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

  const positional = args.find((a: string) => !a.startsWith("--"));
  const isNonInteractive = hasFlag("yes") || !process.stdin.isTTY;
  const force = hasFlag("force");

  // --- Step 1: Resolve projectName and schemaPath (CLI-only, always needed) ---

  let projectName = positional ?? flagValue("name");
  let schemaPath = flagValue("schema") ?? "./schema.json";
  let lang = flagValue("lang") as "ts" | "js" | undefined;

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
    lang ??= "ts";
  } else {
    const nameResult = await p.text({
      message: "Project name",
      initialValue: projectName,
      placeholder: "my-api",
      validate: validateProjectName,
    });
    if (p.isCancel(nameResult)) cancelled();
    projectName = nameResult;

    const schemaResult = await p.text({
      message: "Path to schema file",
      initialValue: schemaPath,
      validate: (val) => {
        if (!val) return "Schema path is required";
        if (!existsSync(resolve(val))) return `File not found: ${val}`;
      },
    });
    if (p.isCancel(schemaResult)) cancelled();
    schemaPath = schemaResult;
  }

  // --- Step 2: Load schema.json (the contract) ---

  const absSchemaPath = resolve(schemaPath);

  if (!existsSync(absSchemaPath)) {
    p.cancel(`Schema file not found: ${absSchemaPath}`);
    process.exit(1);
  }

  const loaded = (() => {
    try {
      return loadSchema(absSchemaPath);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      p.cancel(`Failed to load schema: ${msg}`);
      return process.exit(1) as never;
    }
  })();

  const { config: schema, explicitKeys, explicitDbKeys } = loaded;

  // --- Step 3: Prompt only for what's missing from schema ---

  // Parse CLI flags for overrides
  const driverFlag = flagValue("driver") as Driver | undefined;
  const ormFlag = flagValue("orm") as Orm | undefined;
  const middlewareFlag = flagValue("middleware");
  const middlewareParsed: string[] | undefined = middlewareFlag
    ?.split(",")
    .map((s: string) => s.trim())
    .filter((s: string) =>
      VALID_MIDDLEWARE.includes(s as (typeof VALID_MIDDLEWARE)[number]),
    );
  const validationFlag = flagValue("validation") as Validation | undefined;
  const openapiFlag = hasFlag("openapi");
  const gitFlag = hasFlag("git") ? true : hasFlag("no-git") ? false : undefined;
  const installFlag = hasFlag("install")
    ? true
    : hasFlag("no-install")
      ? false
      : undefined;
  const pkgManagerFlag = flagValue("pkg-manager");

  // CLI flags override schema values immediately
  if (driverFlag) schema.database.driver = driverFlag;
  if (ormFlag) schema.database.orm = ormFlag;
  if (middlewareFlag !== undefined)
    schema.middleware = (middlewareParsed ?? []) as ("cors" | "logger")[];
  if (validationFlag) schema.validation = validationFlag;
  if (openapiFlag) schema.openapi = true;

  let interactiveInstall: boolean | undefined;
  let interactiveGit: boolean | undefined;
  let interactivePkgManager: string | undefined;

  if (!isNonInteractive) {
    // lang: always prompt (CLI-only, not in schema)
    if (!lang) {
      const langResult = await p.select({
        message: "Language",
        initialValue: "ts" as const,
        options: [
          { value: "ts" as const, label: "TypeScript" },
          { value: "js" as const, label: "JavaScript" },
        ],
      });
      if (p.isCancel(langResult)) cancelled();
      lang = langResult;
    }

    // driver: only prompt if not in schema AND not provided via flag
    if (!explicitKeys.has("database") && !driverFlag) {
      const driverResult = await p.select({
        message: "Database",
        initialValue: "sqlite" as const,
        options: [
          { value: "sqlite" as const, label: "SQLite" },
          { value: "postgres" as const, label: "PostgreSQL" },
          { value: "mysql" as const, label: "MySQL" },
        ],
      });
      if (p.isCancel(driverResult)) cancelled();
      schema.database.driver = driverResult;
    }

    // orm: only prompt if not in schema AND not provided via flag
    if (!explicitDbKeys.has("orm") && !ormFlag) {
      const ormResult = await p.select({
        message: "ORM",
        initialValue: "drizzle" as const,
        options: [
          { value: "drizzle" as const, label: "Drizzle ORM" },
          { value: "prisma" as const, label: "Prisma" },
        ],
      });
      if (p.isCancel(ormResult)) cancelled();
      schema.database.orm = ormResult;
    }

    // middleware: only prompt if not in schema AND not provided via flag
    if (!explicitKeys.has("middleware") && middlewareFlag === undefined) {
      const mwResult = await p.multiselect({
        message: "Middleware",
        options: [
          { value: "cors" as const, label: "CORS" },
          { value: "logger" as const, label: "Logger" },
        ],
        initialValues: [],
        required: false,
      });
      if (p.isCancel(mwResult)) cancelled();
      schema.middleware = mwResult as ("cors" | "logger")[];
    }

    // validation: only prompt if not in schema AND not provided via flag
    if (!explicitKeys.has("validation") && !validationFlag) {
      const valResult = await p.select({
        message: "Validation",
        initialValue: "manual" as const,
        options: [
          { value: "manual" as const, label: "Manual (safeParse)" },
          { value: "hono-zod" as const, label: "Hono Zod Validator" },
        ],
      });
      if (p.isCancel(valResult)) cancelled();
      schema.validation = valResult;
    }

    // openapi: only prompt if not in schema AND not provided via flag
    if (!explicitKeys.has("openapi") && !openapiFlag) {
      const oaResult = await p.confirm({
        message: "OpenAPI docs (Scalar)?",
        initialValue: false,
      });
      if (p.isCancel(oaResult)) cancelled();
      schema.openapi = oaResult;
    }

    // install dependencies
    if (installFlag === undefined) {
      const installResult = await p.confirm({
        message: "Install dependencies?",
        initialValue: true,
      });
      if (p.isCancel(installResult)) cancelled();
      if (installResult && pkgManagerFlag === undefined) {
        const pmResult = await p.select({
          message: "Package manager",
          initialValue: detectPackageManager(),
          options: [
            { value: "npm", label: "npm" },
            { value: "pnpm", label: "pnpm" },
            { value: "yarn", label: "yarn" },
            { value: "bun", label: "bun" },
          ],
        });
        if (p.isCancel(pmResult)) cancelled();
        interactivePkgManager = pmResult as string;
      }
      interactiveInstall = installResult;
    }

    // git init
    if (gitFlag === undefined) {
      const gitResult = await p.confirm({
        message: "Initialize git repository?",
        initialValue: true,
      });
      if (p.isCancel(gitResult)) cancelled();
      interactiveGit = gitResult;
    }
  }

  lang ??= "ts";

  const shouldGit = gitFlag ?? interactiveGit ?? isNonInteractive;
  const shouldInstall = installFlag ?? interactiveInstall ?? isNonInteractive;
  const pkgManager =
    pkgManagerFlag ?? interactivePkgManager ?? detectPackageManager();

  // --- Step 4: Resolve output directory ---

  const isCwd = projectName === ".";
  const outputDir = isCwd ? process.cwd() : resolve(projectName);
  const displayName = isCwd ? basename(process.cwd()) : projectName;

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
    if (p.isCancel(overwrite) || !overwrite) cancelled();
  }

  // --- Step 5: Generate project ---

  p.log.info(
    `Creating ${displayName} — ${schema.collections.length} collection(s) [${schema.database.driver} + ${schema.database.orm}]`,
  );
  for (const col of schema.collections) {
    p.log.step(`  ${col.name} (${Object.keys(col.fields).length} fields)`);
  }

  const s = p.spinner();
  s.start("Generating project...");

  const files = generateProject(schema, outputDir, absSchemaPath, lang);

  s.stop(`${files.length} files created`);

  p.note(files.map((f) => `  ${f}`).join("\n"), outputDir);

  // --- Post-generation: git init ---
  if (shouldGit) {
    const sg = p.spinner();
    sg.start("Initializing git repository...");
    try {
      execSync("git init", { cwd: outputDir, stdio: "ignore" });
      sg.stop("Git repository initialized");
    } catch {
      sg.stop("Git init failed (git not found?)");
    }
  }

  // --- Post-generation: install dependencies ---
  if (shouldInstall) {
    const si = p.spinner();
    si.start(`Installing dependencies with ${pkgManager}...`);
    try {
      execSync(`${pkgManager} install`, { cwd: outputDir, stdio: "ignore" });
      si.stop("Dependencies installed");
    } catch {
      si.stop(`Install failed — run \`${pkgManager} install\` manually`);
    }
  }

  // --- Next steps (skip already-done actions) ---
  const steps: string[] = [];
  if (!isCwd) steps.push(`  cd ${projectName}`);
  if (!shouldInstall) steps.push(`  ${pkgManager} install`);
  steps.push(`  ${pkgManager} run dev`);

  p.log.info("Next steps:");
  for (const step of steps) p.log.step(step);

  p.outro("Done!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
