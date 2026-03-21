import { render } from "../templates/engine.js";
import type { GeneratorContext } from "../core/context.js";
import template from "../templates/prisma/filter-parser.hbs";

export function generatePrismaFilterParser(ctx: GeneratorContext): string {
  return render(template, { lang: ctx.lang });
}
