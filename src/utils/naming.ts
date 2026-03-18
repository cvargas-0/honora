export function toPascalCase(str: string): string {
  return str
    .split(/[_\-\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");
}

export function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

export function singularize(str: string): string {
  if (str.endsWith("ies")) return str.slice(0, -3) + "y";
  if (str.endsWith("ses") || str.endsWith("xes") || str.endsWith("zes")) return str.slice(0, -2);
  if (str.endsWith("s") && !str.endsWith("ss")) return str.slice(0, -1);
  return str;
}
