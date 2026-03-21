import { basename } from "node:path";
import type { GeneratorContext } from "../core/context.js";

function drizzleDriverDeps(driver: GeneratorContext["driver"]): {
  deps: Record<string, string>;
  devDeps: Record<string, string>;
} {
  if (driver === "postgres") {
    return {
      deps: { postgres: "^3.5.0" },
      devDeps: {},
    };
  }
  if (driver === "mysql") {
    return {
      deps: { mysql2: "^3.14.0" },
      devDeps: {},
    };
  }
  return {
    deps: { "better-sqlite3": "^12.8.0" },
    devDeps: { "@types/better-sqlite3": "^7.6.13" },
  };
}

export function generatePackageJson(
  outputDir: string,
  ctx: GeneratorContext,
): string {
  const { lang, driver, orm, validation, openapi } = ctx;
  const name = basename(outputDir);
  const isPrisma = orm === "prisma";

  const db = isPrisma ? { deps: {}, devDeps: {} } : drizzleDriverDeps(driver);

  const ormDeps: Record<string, string> = isPrisma
    ? { "@prisma/client": "^6.9.0" }
    : { "drizzle-orm": "^0.45.1", ...db.deps };

  const dependencies: Record<string, string> = {
    "@hono/node-server": "^1.19.11",
    hono: "^4.12.8",
    zod: "^4.3.6",
    ...ormDeps,
    ...(validation === "hono-zod" && !openapi ? { "@hono/zod-validator": "^0.5.0" } : {}),
    ...(openapi ? { "@hono/zod-openapi": "^1.2.3", "@scalar/hono-api-reference": "^0.5.182" } : {}),
  };

  const dbScripts: Record<string, string> = isPrisma
    ? {
        "db:generate": "prisma generate",
        "db:migrate": "prisma migrate dev",
        "db:push": "prisma db push",
        "db:studio": "prisma studio",
      }
    : {
        "db:generate": "drizzle-kit generate",
        "db:migrate": "drizzle-kit migrate",
        "db:push": "drizzle-kit push",
        "db:studio": "drizzle-kit studio",
      };

  const scripts: Record<string, string> =
    lang === "ts"
      ? {
          dev: "tsx watch src/index.ts",
          build: "tsup src/index.ts --format esm --target node18 --dts",
          start: "node dist/index.js",
          ...dbScripts,
        }
      : {
          dev: "node --watch src/index.js",
          start: "node src/index.js",
          ...dbScripts,
        };

  const ormDevDeps: Record<string, string> = isPrisma
    ? { prisma: "^6.9.0" }
    : { "drizzle-kit": "^0.31.10", ...db.devDeps };

  const devDependencies: Record<string, string> =
    lang === "ts"
      ? {
          "@types/node": "^25.5.0",
          tsup: "^8.5.1",
          tsx: "^4.19.0",
          typescript: "^5.9.3",
          ...ormDevDeps,
        }
      : {
          ...ormDevDeps,
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
