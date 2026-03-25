import { render } from "../templates/engine.js";
import type { SchemaConfig } from "../core/schema-parser.js";
import type { GeneratorContext } from "../core/context.js";
import template from "../templates/routes/index.hbs";

export function generateRoutesIndex(
  schema: SchemaConfig,
  ctx: GeneratorContext,
): string {
  return render(template, {
    lang: ctx.lang,
    middleware: ctx.middleware,
    openapi: ctx.openapi,
    collections: schema.collections.map((c) => ({ name: c.name })),
    schemaJson: JSON.stringify(schema, null, 2),
  });
}
