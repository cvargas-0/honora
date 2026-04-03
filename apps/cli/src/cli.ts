import { exec } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { promisify } from "node:util";

const execAsync = promisify(exec);
import * as p from "@clack/prompts";
import { generateProject } from "@honora/generator";
import type { Driver, Orm, Validation } from "./prompts/utils";
import { gatherConfig, type ParsedFlags } from "./prompts/index";
import { promptOverwrite } from "./prompts/overwrite";
import pkg from "../package.json";

const VERSION = pkg.version;

const BANNER = `
 ██╗  ██╗ ██████╗ ███╗   ██╗ ██████╗ ██████╗  █████╗
 ██║  ██║██╔═══██╗████╗  ██║██╔═══██╗██╔══██╗██╔══██╗
 ███████║██║   ██║██╔██╗ ██║██║   ██║██████╔╝███████║
 ██╔══██║██║   ██║██║╚██╗██║██║   ██║██╔══██╗██╔══██║
 ██║  ██║╚██████╔╝██║ ╚████║╚██████╔╝██║  ██║██║  ██║
 ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝
`;

const gradientColors = [
  "\x1b[38;2;255;91;17m",
  "\x1b[38;2;240;120;50m",
  "\x1b[38;2;217;119;87m",
  "\x1b[38;2;201;100;66m",
  "\x1b[38;2;246;130;31m",
  "\x1b[38;2;250;173;63m",
];

function renderBanner(): string {
  const reset = "\x1b[0m";
  const lines = BANNER.split("\n").filter((l) => l.length > 0);
  return lines
    .map(
      (line, i) =>
        `${gradientColors[i % gradientColors.length]}${line}${reset}`,
    )
    .join("\n");
}

const HELP = `
honora v${VERSION}

Usage: honora <name> [options]

Arguments:
  <name>              Project name or path (relative to current directory). Use "." for current directory.

Options:
  --schema <path>     Path to schema file (default: ./schema.json)
  --lang <ts|js>      Output language (default: ts)
  --driver <driver>   Database driver: sqlite, postgres, mysql
  --orm <orm>         ORM: drizzle, prisma
  --middleware <list>  Comma-separated: cors,logger
  --methods <list>    Comma-separated REST methods for all collections: get,getId,post,put,patch,delete,options
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

  console.log(renderBanner());
  p.intro(`honora v${VERSION}`);

  const positional = args.find((a: string) => !a.startsWith("--"));
  const isNonInteractive = hasFlag("yes") || !process.stdin.isTTY;
  const force = hasFlag("force");

  const flags: ParsedFlags = {
    positional,
    schemaPath: flagValue("schema"),
    lang: flagValue("lang"),
    driver: flagValue("driver") as Driver | undefined,
    orm: flagValue("orm") as Orm | undefined,
    middleware: flagValue("middleware"),
    methods: flagValue("methods"),
    validation: flagValue("validation") as Validation | undefined,
    openapi: hasFlag("openapi"),
    git: hasFlag("git") ? true : hasFlag("no-git") ? false : undefined,
    install: hasFlag("install")
      ? true
      : hasFlag("no-install")
        ? false
        : undefined,
    pkgManager: flagValue("pkg-manager"),
  };

  const {
    projectName,
    schemaPath,
    lang,
    schema,
    shouldGit,
    shouldInstall,
    pkgManager,
  } = await gatherConfig(flags, isNonInteractive);

  // --- Resolve output directory ---
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
    const overwrite = await promptOverwrite(projectName);
    if (!overwrite) {
      p.cancel("Cancelled.");
      process.exit(0);
    }
  }

  // --- Generate project ---
  p.log.info(
    `Creating ${displayName} — ${schema.collections.length} collection(s) [${schema.database.driver} + ${schema.database.orm}]`,
  );
  for (const col of schema.collections) {
    p.log.step(`  ${col.name} (${Object.keys(col.fields).length} fields)`);
  }

  const s = p.spinner();
  s.start("Generating project...");
  const files = generateProject(schema, outputDir, schemaPath, lang);
  s.stop(`${files.length} files created`);

  p.note(files.map((f) => `  ${f}`).join("\n"), outputDir);

  // --- Post-generation: git init ---
  if (shouldGit) {
    const sg = p.spinner();
    sg.start("Initializing git repository...");
    try {
      await execAsync("git init", { cwd: outputDir });
      writeFileSync(
        `${outputDir}/.gitignore`,
        [
          "node_modules/",
          "dist/",
          ".env",
          ".env.*",
          "!.env.example",
          "*.db",
          "*.sqlite",
        ].join("\n") + "\n",
      );
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
      await execAsync(`${pkgManager} install`, { cwd: outputDir });
      si.stop("Dependencies installed");
    } catch {
      si.stop(`Install failed — run \`${pkgManager} install\` manually`);
    }
  }

  // --- Next steps ---
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
