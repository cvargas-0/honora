import { render } from "../templates/engine.js";
import type { DatabaseConfig } from "../core/schema-parser.js";
import type { GeneratorContext } from "../core/context.js";
import template from "../templates/config/drizzle-config.hbs";

function drizzleDialect(driver: GeneratorContext["driver"]): string {
  if (driver === "postgres") return "postgresql";
  if (driver === "mysql") return "mysql";
  return "sqlite";
}

export function generateDrizzleConfig(database: DatabaseConfig, ctx: GeneratorContext): string {
  return render(template, {
    lang: ctx.lang,
    dialect: drizzleDialect(ctx.driver),
    dbUrl: database.url,
  });
}
