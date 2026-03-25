import { render } from "../../templates/engine";
import type { DatabaseConfig, GeneratorContext } from "@honora/types";
import template from "../../templates/drizzle/client.hbs";

export function generateDbClient(database: DatabaseConfig, ctx: GeneratorContext): string {
  return render(template, { lang: ctx.lang, driver: ctx.driver, dbUrl: database.url });
}
