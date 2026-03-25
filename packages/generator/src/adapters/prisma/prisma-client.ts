import { render } from "../../templates/engine.js";
import type { GeneratorContext } from "@honora/types";
import template from "../../templates/prisma/client.hbs";

export function generatePrismaClient(ctx: GeneratorContext): string {
  return render(template, { lang: ctx.lang });
}
