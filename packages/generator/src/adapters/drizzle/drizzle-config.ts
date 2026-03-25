import { render } from "../../templates/engine";
import type { DatabaseConfig, GeneratorContext } from "@honora/types";
import template from "../../templates/drizzle/drizzle-config.hbs";

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
