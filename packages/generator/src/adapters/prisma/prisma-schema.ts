import { render } from "../../templates/engine";
import type { Collection, Field, GeneratorContext } from "@honora/types";
import template from "../../templates/prisma/schema.prisma.hbs";

function prismaType(field: Field, driver: GeneratorContext["driver"]): string {
  const optional = !field.required ? "?" : "";
  const unique = field.unique ? " @unique" : "";
  const defaultVal =
    field.default !== undefined ? ` @default(${prismaDefault(field)})` : "";

  switch (field.type) {
    case "text":
      return `String${optional}${unique}${defaultVal}`;
    case "number":
      return `Float${optional}${unique}${defaultVal}`;
    case "integer":
      return `Int${optional}${unique}${defaultVal}`;
    case "boolean":
      return `Boolean${optional}${unique}${defaultVal}`;
    case "date":
      return `DateTime${optional}${unique}${defaultVal}`;
    case "json":
      return `Json${optional}${defaultVal}`;
    case "relation":
      return `String${optional}${unique}`;
    default:
      return `String${optional}`;
  }
}

function prismaDefault(field: Field): string {
  if (field.default === undefined) return "";
  if (typeof field.default === "string") return `"${field.default}"`;
  if (typeof field.default === "boolean") return field.default ? "true" : "false";
  return String(field.default);
}

function toModelName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function onDeletePrisma(strategy: string): string {
  switch (strategy) {
    case "cascade":
      return "Cascade";
    case "set_null":
      return "SetNull";
    default:
      return "Restrict";
  }
}

export function generatePrismaSchema(collections: Collection[], ctx: GeneratorContext): string {
  const collectionsData = collections.map((col) => {
    const columns = Object.entries(col.fields)
      .filter(([, f]) => f.type !== "relation")
      .map(([name, field]) => ({
        name,
        prismaType: prismaType(field, ctx.driver),
      }));

    const relationFkColumns = Object.entries(col.fields)
      .filter(([, f]) => f.type === "relation")
      .map(([name, field]) => ({
        name,
        prismaType: prismaType(field, ctx.driver),
      }));

    const relations = Object.entries(col.fields)
      .filter(([, f]) => f.type === "relation" && f.collection)
      .map(([name, f]) => ({
        relName: `${name}Ref`,
        fieldName: name,
        targetModel: toModelName(f.collection!),
        onDeletePrisma: onDeletePrisma(f.onDelete),
      }));

    const idConfig = col.id;
    let idType = "uuid";
    if (idConfig.type === "integer" && idConfig.autoincrement) {
      idType = "autoincrement";
    } else if (idConfig.type === "integer") {
      idType = "integer";
    } else if (idConfig.type === "text") {
      idType = "text";
    }

    return {
      modelName: toModelName(col.name),
      tableName: col.name,
      idType,
      columns: [...relationFkColumns, ...columns],
      relations: relations.length > 0 ? relations : undefined,
    };
  });

  return render(template, {
    driver: ctx.driver,
    collections: collectionsData,
  });
}
