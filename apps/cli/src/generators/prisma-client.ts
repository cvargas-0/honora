import { render } from "../templates/engine.js";
import type { GeneratorContext } from "../core/context.js";
import template from "../templates/prisma/client.hbs";

export function generatePrismaClient(ctx: GeneratorContext): string {
  return render(template, { lang: ctx.lang });
}
