import * as p from "@clack/prompts";
import { cancelled } from "./utils";

export async function promptGit(flagValue?: boolean): Promise<boolean> {
  if (flagValue !== undefined) return flagValue;

  const result = await p.confirm({
    message: "Initialize git repository?",
    initialValue: true,
  });
  if (p.isCancel(result)) cancelled();
  return result;
}
