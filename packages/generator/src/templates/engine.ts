import Handlebars from "handlebars";

const hbs = Handlebars.create();

// Comparison helpers
hbs.registerHelper("eq", (a, b) => a === b);
hbs.registerHelper("neq", (a, b) => a !== b);

// Logical helpers
hbs.registerHelper("or", (...args) => {
  // Last arg is the Handlebars options object
  const values = args.slice(0, -1);
  return values.some(Boolean);
});

hbs.registerHelper("and", (...args) => {
  const values = args.slice(0, -1);
  return values.every(Boolean);
});

// JSON.stringify helper
hbs.registerHelper("json", (value) => JSON.stringify(value));

// Join array with separator
hbs.registerHelper("join", (arr: string[], sep: string) => arr.join(sep));

// File extension: returns ".js" for JS output, "" for TS
hbs.registerHelper("ext", (lang: string) => (lang === "js" ? ".js" : ""));

// Array includes check
hbs.registerHelper("includes", (arr: unknown[], value: unknown) =>
  Array.isArray(arr) && arr.includes(value),
);

const cache = new Map<string, HandlebarsTemplateDelegate>();

export function render(templateSource: string, context: object): string {
  let compiled = cache.get(templateSource);
  if (!compiled) {
    compiled = hbs.compile(templateSource, { noEscape: true });
    cache.set(templateSource, compiled);
  }
  return compiled(context);
}
