import { render } from "../templates/engine.js";
import template from "../templates/entry.hbs";

export function generateEntry(lang: "ts" | "js"): string {
  return render(template, { lang });
}
