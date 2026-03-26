import * as p from "@clack/prompts";
import { cancelled } from "./utils";

export async function promptOpenapi(flagValue?: boolean): Promise<boolean> {
  if (flagValue !== undefined) return flagValue;

  const result = await p.confirm({
    message: "OpenAPI docs (Scalar)?",
    initialValue: false,
  });
  if (p.isCancel(result)) cancelled();
  return result;
}
