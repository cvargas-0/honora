import { render } from "../templates/engine.js";
import type { DatabaseConfig } from "../core/schema-parser.js";
import template from "../templates/db/client.hbs";

export function generateDbClient(database: DatabaseConfig, lang: "ts" | "js"): string {
  return render(template, { lang, dbUrl: database.url });
}
