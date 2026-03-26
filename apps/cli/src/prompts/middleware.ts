import * as p from "@clack/prompts";
import { cancelled, VALID_MIDDLEWARE } from "./utils";

export function parseMiddlewareFlag(raw: string): ("cors" | "logger")[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is "cors" | "logger" =>
      VALID_MIDDLEWARE.includes(s as (typeof VALID_MIDDLEWARE)[number]),
    );
}

export async function promptMiddleware(
  flagValue?: string,
): Promise<("cors" | "logger")[]> {
  if (flagValue !== undefined) return parseMiddlewareFlag(flagValue);

  const result = await p.multiselect({
    message: "Middleware",
    options: [
      { value: "cors" as const, label: "CORS" },
      { value: "logger" as const, label: "Logger" },
    ],
    initialValues: [],
    required: false,
  });
  if (p.isCancel(result)) cancelled();
  return result as ("cors" | "logger")[];
}
