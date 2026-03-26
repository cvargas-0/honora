import { existsSync } from "node:fs";
import { resolve } from "node:path";
import * as p from "@clack/prompts";
import { cancelled } from "./utils";

export async function promptSchemaPath(flagValue?: string): Promise<string> {
  const initial = flagValue ?? "./schema.json";
  const result = await p.text({
    message: "Path to schema file",
    initialValue: initial,
    validate: (val) => {
      if (!val) return "Schema path is required";
      if (!existsSync(resolve(val))) return `File not found: ${val}`;
    },
  });
  if (p.isCancel(result)) cancelled();
  return result;
}
