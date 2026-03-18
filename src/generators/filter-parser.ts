import { render } from "../templates/engine.js";
import template from "../templates/utils/filter-parser.hbs";

export function generateFilterParser(lang: "ts" | "js"): string {
  return render(template, { lang });
}
