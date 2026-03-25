import type { Field } from "@honora/types";

export function zodExpression(field: Field): string {
  let expr: string;
  switch (field.type) {
    case "text":
      expr = "z.string()";
      if (field.min !== undefined) expr += `.min(${field.min})`;
      if (field.max !== undefined) expr += `.max(${field.max})`;
      break;
    case "number":
      expr = "z.number()";
      if (field.min !== undefined) expr += `.min(${field.min})`;
      if (field.max !== undefined) expr += `.max(${field.max})`;
      break;
    case "integer":
      expr = "z.number().int()";
      if (field.min !== undefined) expr += `.min(${field.min})`;
      if (field.max !== undefined) expr += `.max(${field.max})`;
      break;
    case "boolean":
      expr = "z.boolean()";
      break;
    case "date":
      expr = "z.string().datetime({ offset: true }).or(z.string().date())";
      break;
    case "json":
      expr = "z.any()";
      break;
    case "relation":
      expr = "z.string().min(1)";
      break;
    default:
      expr = "z.any()";
  }
  return expr;
}
