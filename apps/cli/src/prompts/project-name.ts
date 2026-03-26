import * as p from "@clack/prompts";
import { cancelled } from "./utils";

const VALID_NAME = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

export function validateProjectName(name: string | undefined): string | undefined {
  if (!name || name.trim() === "") return "Project name is required";
  if (name === ".") return undefined;
  if (!VALID_NAME.test(name))
    return "Invalid project name (use lowercase, hyphens, no spaces)";
}

export async function promptProjectName(positional?: string): Promise<string> {
  const result = await p.text({
    message: "Project name",
    initialValue: positional,
    placeholder: "my-api",
    validate: validateProjectName,
  });
  if (p.isCancel(result)) cancelled();
  return result;
}
