import * as p from "@clack/prompts";
import { cancelled } from "./utils";

export async function promptOverwrite(projectName: string): Promise<boolean> {
  const result = await p.confirm({
    message: `Directory "${projectName}" already exists. Overwrite?`,
    initialValue: false,
  });
  if (p.isCancel(result)) cancelled();
  return result;
}
