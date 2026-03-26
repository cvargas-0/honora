import * as p from "@clack/prompts";
import type { DatabaseConfig, GeneratorContext } from "@honora/types";

export type Driver = DatabaseConfig["driver"];
export type Orm = DatabaseConfig["orm"];
export type Validation = GeneratorContext["validation"];

export const VALID_MIDDLEWARE = ["cors", "logger"] as const;

export function cancelled(): never {
  p.cancel("Cancelled.");
  return process.exit(0) as never;
}
