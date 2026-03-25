import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { schemaConfigSchema } from "@honora/types";
import type { LoadedSchema } from "@honora/types";

/**
 * Loads and validates a schema.json file from disk.
 * Returns the validated config plus sets of explicitly provided keys,
 * so the CLI can distinguish user-defined values from Zod defaults.
 */
export function loadSchema(path: string): LoadedSchema {
  const absPath = resolve(path);
  const raw = readFileSync(absPath, "utf-8");
  const json = JSON.parse(raw);
  const explicitKeys = new Set<string>(Object.keys(json));
  const explicitDbKeys = new Set<string>(Object.keys(json.database ?? {}));
  const config = schemaConfigSchema.parse(json);
  return { config, explicitKeys, explicitDbKeys };
}
