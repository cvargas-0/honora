import { existsSync } from "node:fs";
import { resolve } from "node:path";
import * as p from "@clack/prompts";
import { loadSchema } from "@honora/generator";
import type { LoadedSchema, SchemaConfig } from "@honora/types";
import { promptProjectName, validateProjectName } from "./project-name";
import { promptSchemaPath } from "./schema-path";
import { promptLang } from "./lang";
import { promptDriver } from "./driver";
import { promptOrm } from "./orm";
import { promptMiddleware, parseMiddlewareFlag } from "./middleware";
import { promptValidation } from "./validation";
import { promptOpenapi } from "./openapi";
import { promptInstall, detectPackageManager } from "./install";
import { promptGit } from "./git";
import type { Driver, Orm, Validation } from "./utils";

export interface ParsedFlags {
  positional?: string;
  schemaPath?: string;
  lang?: string;
  driver?: Driver;
  orm?: Orm;
  middleware?: string;
  methods?: string;
  validation?: Validation;
  openapi: boolean;
  git?: boolean;
  install?: boolean;
  pkgManager?: string;
}

export interface GatheredConfig {
  projectName: string;
  schemaPath: string;
  lang: "ts" | "js";
  schema: SchemaConfig;
  shouldGit: boolean;
  shouldInstall: boolean;
  pkgManager: string;
}

export async function gatherConfig(
  flags: ParsedFlags,
  isNonInteractive: boolean,
): Promise<GatheredConfig> {
  // --- Project name ---
  let projectName: string;
  if (isNonInteractive) {
    if (!flags.positional) {
      p.cancel(
        "Enter your project name or path (relative to current directory) as a positional argument, e.g. `honora my-project` or `honora ./my-project`.",
      );
      process.exit(1);
    }
    const nameErr = validateProjectName(flags.positional);
    if (nameErr) {
      p.cancel(nameErr);
      process.exit(1);
    }
    projectName = flags.positional;
  } else {
    projectName = await promptProjectName(flags.positional);
  }

  // --- Schema path ---
  let schemaPath: string;
  if (isNonInteractive) {
    schemaPath = flags.schemaPath ?? "./schema.json";
  } else {
    schemaPath = await promptSchemaPath(flags.schemaPath);
  }

  const absSchemaPath = resolve(schemaPath);

  if (!existsSync(absSchemaPath)) {
    p.cancel(`Schema file not found: ${absSchemaPath}`);
    process.exit(1);
  }

  let loaded: LoadedSchema;
  try {
    loaded = loadSchema(absSchemaPath);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    p.cancel(`Failed to load schema: ${msg}`);
    process.exit(1) as never;
    throw err;
  }

  const { config: schema, explicitKeys, explicitDbKeys } = loaded;

  // --- Apply CLI flag overrides immediately ---
  if (flags.driver) schema.database.driver = flags.driver;
  if (flags.orm) schema.database.orm = flags.orm;
  if (flags.middleware !== undefined)
    schema.middleware = parseMiddlewareFlag(flags.middleware);
  if (flags.methods !== undefined) {
    const methods = flags.methods.split(",").map((m) => m.trim()).filter(Boolean) as typeof schema.collections[0]["methods"];
    for (const col of schema.collections) col.methods = methods;
  }
  if (flags.validation) schema.validation = flags.validation;
  if (flags.openapi) schema.openapi = true;

  // --- Language ---
  const lang = isNonInteractive
    ? ((flags.lang as "ts" | "js" | undefined) ?? "ts")
    : await promptLang(flags.lang);

  if (!isNonInteractive) {
    // driver: only if not in schema AND not provided via flag
    if (!explicitKeys.has("database") && !flags.driver) {
      schema.database.driver = await promptDriver();
    }

    // orm: only if not in schema AND not provided via flag
    if (!explicitDbKeys.has("orm") && !flags.orm) {
      schema.database.orm = await promptOrm();
    }

    // middleware: only if not in schema AND not provided via flag
    if (!explicitKeys.has("middleware") && flags.middleware === undefined) {
      schema.middleware = await promptMiddleware();
    }

    // validation: only if not in schema AND not provided via flag
    if (!explicitKeys.has("validation") && !flags.validation) {
      schema.validation = await promptValidation();
    }

    // openapi: only if not in schema AND not provided via flag
    if (!explicitKeys.has("openapi") && !flags.openapi) {
      schema.openapi = await promptOpenapi();
    }
  }

  // --- Git + Install ---
  const shouldGit: boolean = isNonInteractive
    ? (flags.git ?? true)
    : await promptGit(flags.git);

  const { install: shouldInstall, pkgManager } = isNonInteractive
    ? {
        install: flags.install ?? true,
        pkgManager: flags.pkgManager ?? detectPackageManager(),
      }
    : await promptInstall(flags.install, flags.pkgManager);

  return {
    projectName,
    schemaPath: absSchemaPath,
    lang,
    schema,
    shouldGit,
    shouldInstall,
    pkgManager,
  };
}
