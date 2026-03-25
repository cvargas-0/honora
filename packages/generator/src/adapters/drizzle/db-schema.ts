import { render } from "../../templates/engine";
import type { Collection, Field, IdConfig, GeneratorContext } from "@honora/types";
import template from "../../templates/drizzle/schema.hbs";

type Driver = GeneratorContext["driver"];

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

function idColumnExpression(idConfig: IdConfig, driver: Driver): string {
  if (driver === "postgres") {
    switch (idConfig.type) {
      case "uuid":
        return 'uuid("id").primaryKey().defaultRandom()';
      case "integer":
        return idConfig.autoincrement
          ? 'serial("id").primaryKey()'
          : 'integer("id").primaryKey()';
      case "text":
        return 'text("id").primaryKey()';
      default:
        return 'uuid("id").primaryKey().defaultRandom()';
    }
  }

  if (driver === "mysql") {
    switch (idConfig.type) {
      case "uuid":
        return 'varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID())';
      case "integer":
        return idConfig.autoincrement
          ? 'serial("id").primaryKey()'
          : 'int("id").primaryKey()';
      case "text":
        return 'varchar("id", { length: 255 }).primaryKey()';
      default:
        return 'varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID())';
    }
  }

  // sqlite
  switch (idConfig.type) {
    case "uuid":
      return 'text("id").primaryKey().$defaultFn(() => crypto.randomUUID())';
    case "integer":
      return idConfig.autoincrement
        ? 'integer("id").primaryKey({ autoIncrement: true })'
        : 'integer("id").primaryKey()';
    case "text":
      return 'text("id").primaryKey()';
    default:
      return 'text("id").primaryKey().$defaultFn(() => crypto.randomUUID())';
  }
}

function columnExpression(
  name: string,
  field: Field,
  collections: Collection[],
  driver: Driver,
): string {
  let expr: string;

  if (driver === "postgres") {
    switch (field.type) {
      case "boolean":
        expr = `boolean("${name}")`;
        break;
      case "json":
        expr = `jsonb("${name}")`;
        break;
      case "number":
        expr = `real("${name}")`;
        break;
      case "integer":
        expr = `integer("${name}")`;
        break;
      case "date":
        expr = `timestamp("${name}", { mode: "string" })`;
        break;
      default:
        expr = `text("${name}")`;
        break;
    }
  } else if (driver === "mysql") {
    switch (field.type) {
      case "boolean":
        expr = `boolean("${name}")`;
        break;
      case "json":
        expr = `json("${name}")`;
        break;
      case "number":
        expr = `double("${name}")`;
        break;
      case "integer":
        expr = `int("${name}")`;
        break;
      case "date":
        expr = `timestamp("${name}", { mode: "string" })`;
        break;
      case "relation":
        expr = `varchar("${name}", { length: 255 })`;
        break;
      default:
        expr = `varchar("${name}", { length: 255 })`;
        break;
    }
  } else {
    // sqlite
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

function systemColumns(driver: Driver): { createdAt: string; updatedAt: string } {
  if (driver === "postgres" || driver === "mysql") {
    return {
      createdAt: 'timestamp("created_at", { mode: "string" }).notNull().defaultNow()',
      updatedAt: 'timestamp("updated_at", { mode: "string" }).notNull().defaultNow()',
    };
  }
  return {
    createdAt: 'text("created_at").notNull().$defaultFn(() => new Date().toISOString())',
    updatedAt: 'text("updated_at").notNull().$defaultFn(() => new Date().toISOString())',
  };
}

function getImports(driver: Driver, collections: Collection[]): string[] {
  const hasNumber = collections.some((c) =>
    Object.values(c.fields).some((f) => f.type === "number"),
  );
  const hasDate = collections.some((c) =>
    Object.values(c.fields).some((f) => f.type === "date"),
  );
  const hasJson = collections.some((c) =>
    Object.values(c.fields).some((f) => f.type === "json"),
  );
  const hasBool = collections.some((c) =>
    Object.values(c.fields).some((f) => f.type === "boolean"),
  );
  const hasUuid = collections.some((c) => c.id.type === "uuid");
  const hasSerial = collections.some(
    (c) => c.id.type === "integer" && c.id.autoincrement,
  );

  if (driver === "postgres") {
    const imports = ["pgTable", "text", "integer"];
    if (hasNumber) imports.push("real");
    if (hasBool) imports.push("boolean");
    if (hasJson) imports.push("jsonb");
    if (hasDate) imports.push("timestamp");
    if (hasUuid) imports.push("uuid");
    if (hasSerial) imports.push("serial");
    if (!hasDate) imports.push("timestamp");
    return [...new Set(imports)];
  }

  if (driver === "mysql") {
    const imports = ["mysqlTable", "varchar", "int"];
    if (hasNumber) imports.push("double");
    if (hasBool) imports.push("boolean");
    if (hasJson) imports.push("json");
    imports.push("timestamp");
    if (hasSerial) imports.push("serial");
    return [...new Set(imports)];
  }

  const imports = ["sqliteTable", "text", "integer"];
  if (hasNumber) imports.push("real");
  return imports;
}

function tableConstructor(driver: Driver): string {
  if (driver === "postgres") return "pgTable";
  if (driver === "mysql") return "mysqlTable";
  return "sqliteTable";
}

function drizzlePackage(driver: Driver): string {
  if (driver === "postgres") return "drizzle-orm/pg-core";
  if (driver === "mysql") return "drizzle-orm/mysql-core";
  return "drizzle-orm/sqlite-core";
}

export function generateDbSchema(collections: Collection[], ctx: GeneratorContext): string {
  const sorted = topologicalSort(collections);
  const { driver } = ctx;
  const sys = systemColumns(driver);

  const collectionsData = sorted.map((col) => ({
    name: col.name,
    idExpression: idColumnExpression(col.id, driver),
    columns: Object.entries(col.fields).map(([name, field]) => ({
      name,
      expression: columnExpression(name, field, collections, driver),
    })),
  }));

  return render(template, {
    lang: ctx.lang,
    drizzlePackage: drizzlePackage(driver),
    tableConstructor: tableConstructor(driver),
    imports: getImports(driver, sorted).join(", "),
    createdAtExpr: sys.createdAt,
    updatedAtExpr: sys.updatedAt,
    collections: collectionsData,
  });
}
