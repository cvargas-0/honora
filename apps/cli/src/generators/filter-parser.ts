import { render } from "../templates/engine.js";
import type { GeneratorContext } from "../core/context.js";
import template from "../templates/utils/filter-parser.hbs";

export function generateFilterParser(ctx: GeneratorContext): string {
  return render(template, { lang: ctx.lang });
}
