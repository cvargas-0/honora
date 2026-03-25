import { render } from "../../templates/engine";
import type { GeneratorContext } from "@honora/types";
import template from "../../templates/prisma/filter-parser.hbs";

export function generatePrismaFilterParser(ctx: GeneratorContext): string {
  return render(template, { lang: ctx.lang });
}
