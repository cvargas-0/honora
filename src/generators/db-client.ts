import { render } from "../templates/engine.js";
import type { DatabaseConfig } from "../core/schema-parser.js";
import type { GeneratorContext } from "../core/context.js";
import template from "../templates/db/client.hbs";

export function generateDbClient(database: DatabaseConfig, ctx: GeneratorContext): string {
  return render(template, { lang: ctx.lang, driver: ctx.driver, dbUrl: database.url });
}
