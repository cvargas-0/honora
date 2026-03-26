import * as p from "@clack/prompts";
import { cancelled, type Validation } from "./utils";

export async function promptValidation(flagValue?: Validation): Promise<Validation> {
  if (flagValue) return flagValue;

  const result = await p.select({
    message: "Validation",
    initialValue: "manual" as const,
    options: [
      { value: "manual" as const, label: "Manual (safeParse)" },
      { value: "hono-zod" as const, label: "Hono Zod Validator" },
    ],
  });
  if (p.isCancel(result)) cancelled();
  return result;
}
