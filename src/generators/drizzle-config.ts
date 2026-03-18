import { render } from "../templates/engine.js";
import type { DatabaseConfig } from "../core/schema-parser.js";
import template from "../templates/config/drizzle-config.hbs";

export function generateDrizzleConfig(database: DatabaseConfig, lang: "ts" | "js"): string {
  return render(template, { lang, dbUrl: database.url });
}
