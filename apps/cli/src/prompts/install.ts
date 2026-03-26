import * as p from "@clack/prompts";
import { cancelled } from "./utils";

export function detectPackageManager(): string {
  const agent = process.env.npm_config_user_agent ?? "";
  if (agent.includes("pnpm/")) return "pnpm";
  if (agent.includes("yarn/")) return "yarn";
  if (agent.includes("bun/")) return "bun";
  return "npm";
}

export async function promptInstall(
  installFlag?: boolean,
  pkgManagerFlag?: string,
): Promise<{ install: boolean; pkgManager: string }> {
  if (installFlag !== undefined) {
    return {
      install: installFlag,
      pkgManager: pkgManagerFlag ?? detectPackageManager(),
    };
  }

  const install = await p.confirm({
    message: "Install dependencies?",
    initialValue: true,
  });
  if (p.isCancel(install)) cancelled();

  let pkgManager = pkgManagerFlag ?? detectPackageManager();
  if (install && pkgManagerFlag === undefined) {
    const pm = await p.select({
      message: "Package manager",
      initialValue: detectPackageManager(),
      options: [
        { value: "npm", label: "npm" },
        { value: "pnpm", label: "pnpm" },
        { value: "yarn", label: "yarn" },
        { value: "bun", label: "bun" },
      ],
    });
    if (p.isCancel(pm)) cancelled();
    pkgManager = pm as string;
  }

  return { install, pkgManager };
}
