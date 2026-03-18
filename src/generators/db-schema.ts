import { render } from "../templates/engine.js";
import type { Collection, Field, IdConfig } from "../core/schema-parser.js";
import template from "../templates/db/schema.hbs";

function topologicalSort(collections: Collection[]): Collection[] {
  const byName = new Map(collections.map((c) => [c.name, c]));
  const visited = new Set<string>();
  const sorted: Collection[] = [];

  function visit(name: string) {
    if (visited.has(name)) return;
    visited.add(name);
    const col = byName.get(name);
    if (!col) return;
    for (const field of Object.values(col.fields)) {
      if (field.type === "relation" && field.collection) {
        visit(field.collection);
      }
    }
    sorted.push(col);
  }

  for (const col of collections) visit(col.name);
  return sorted;
}

function idColumnExpression(idConfig: IdConfig): string {
  switch (idConfig.type) {
    case "uuid":
      return 'text("id").primaryKey().$defaultFn(() => crypto.randomUUID())';
    case "integer":
      if (idConfig.autoincrement) {
        return 'integer("id").primaryKey({ autoIncrement: true })';
      }
      return 'integer("id").primaryKey()';
    case "text":
      return 'text("id").primaryKey()';
    default:
      return 'text("id").primaryKey().$defaultFn(() => crypto.randomUUID())';
  }
}

function columnExpression(name: string, field: Field, collections: Collection[]): string {
  let expr: string;

  switch (field.type) {
    case "boolean":
      expr = `integer("${name}", { mode: "boolean" })`;
      break;
    case "json":
      expr = `text("${name}", { mode: "json" })`;
      break;
    case "number":
      expr = `real("${name}")`;
      break;
    case "integer":
      expr = `integer("${name}")`;
      break;
    default:
      expr = `text("${name}")`;
      break;
  }

  if (field.type === "relation" && field.collection) {
    const refExists = collections.some((c) => c.name === field.collection);
    if (refExists) {
      const onDelete = field.onDelete ?? "restrict";
      const drizzleOnDelete = onDelete === "set_null" ? "set null" : onDelete;
      expr += `.references(() => ${field.collection}.id, { onDelete: "${drizzleOnDelete}" })`;
    }
  }

  if (field.required) expr += ".notNull()";
  if (field.unique) expr += ".unique()";
  if (field.default !== undefined && field.type !== "json") {
    expr += `.default(${JSON.stringify(field.default)})`;
  }

  return expr;
}

export function generateDbSchema(collections: Collection[], lang: "ts" | "js"): string {
  const sorted = topologicalSort(collections);

  const needsReal = sorted.some((c) =>
    Object.values(c.fields).some((f) => f.type === "number"),
  );

  const imports = ["sqliteTable", "text", "integer"];
  if (needsReal) imports.push("real");

  const collectionsData = sorted.map((col) => ({
    name: col.name,
    idExpression: idColumnExpression(col.id),
    columns: Object.entries(col.fields).map(([name, field]) => ({
      name,
      expression: columnExpression(name, field, collections),
    })),
  }));

  return render(template, {
    lang,
    imports: imports.join(", "),
    collections: collectionsData,
  });
}
