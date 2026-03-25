import { render } from "../../templates/engine";
import type { GeneratorContext } from "@honora/types";
import template from "../../templates/drizzle/filter-parser.hbs";

export function generateFilterParser(ctx: GeneratorContext): string {
  return render(template, { lang: ctx.lang });
}
