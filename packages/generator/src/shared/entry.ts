import { render } from "../templates/engine";
import type { GeneratorContext } from "@honora/types";
import template from "../templates/shared/entry.hbs";

export function generateEntry(ctx: GeneratorContext): string {
  return render(template, { lang: ctx.lang });
}
