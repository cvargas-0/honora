import * as p from "@clack/prompts";
import { cancelled } from "./utils";

export async function promptLang(flagValue?: string): Promise<"ts" | "js"> {
  if (flagValue === "ts" || flagValue === "js") return flagValue;

  const result = await p.select({
    message: "Language",
    initialValue: "ts" as const,
    options: [
      { value: "ts" as const, label: "TypeScript" },
      { value: "js" as const, label: "JavaScript" },
    ],
  });
  if (p.isCancel(result)) cancelled();
  return result;
}
