import { render } from "../templates/engine.js";
import type { GeneratorContext } from "../core/context.js";
import template from "../templates/entry.hbs";

export function generateEntry(ctx: GeneratorContext): string {
  return render(template, { lang: ctx.lang });
}
