import { render } from "../templates/engine.js";
import type { SchemaConfig } from "../core/schema-parser.js";
import template from "../templates/routes/index.hbs";

export function generateRoutesIndex(schema: SchemaConfig, lang: "ts" | "js"): string {
  return render(template, {
    lang,
    collections: schema.collections.map((c) => ({ name: c.name })),
    schemaJson: JSON.stringify(schema, null, 2),
  });
}
