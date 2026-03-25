import { basename } from "node:path";
import type { GeneratorContext, AdapterDependencies } from "@honora/types";

export function generatePackageJson(
  outputDir: string,
  ctx: GeneratorContext,
  adapterDeps: AdapterDependencies,
): string {
  const { lang, validation, openapi } = ctx;
  const name = basename(outputDir);

  const dependencies: Record<string, string> = {
    "@hono/node-server": "^1.19.11",
    hono: "^4.12.8",
    zod: "^4.3.6",
    ...adapterDeps.dependencies,
    ...(validation === "hono-zod" && !openapi ? { "@hono/zod-validator": "^0.5.0" } : {}),
    ...(openapi ? { "@hono/zod-openapi": "^1.2.3", "@scalar/hono-api-reference": "^0.5.182" } : {}),
  };

  const scripts: Record<string, string> =
    lang === "ts"
      ? {
          dev: "tsx watch src/index.ts",
          build: "tsup src/index.ts --format esm --target node18 --dts",
          start: "node dist/index.js",
          ...adapterDeps.scripts,
        }
      : {
          dev: "node --watch src/index.js",
          start: "node src/index.js",
          ...adapterDeps.scripts,
        };

  const devDependencies: Record<string, string> =
    lang === "ts"
      ? {
          "@types/node": "^25.5.0",
          tsup: "^8.5.1",
          tsx: "^4.19.0",
          typescript: "^5.9.3",
          ...adapterDeps.devDependencies,
        }
      : {
          ...adapterDeps.devDependencies,
        };

  const pkg: Record<string, unknown> = {
    name,
    version: "0.1.0",
    type: "module",
    scripts,
    dependencies,
    devDependencies,
  };

  return JSON.stringify(pkg, null, 2) + "\n";
}
