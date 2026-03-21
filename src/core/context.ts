export interface GeneratorContext {
  lang: "ts" | "js";
  driver: "sqlite" | "postgres" | "mysql";
  middleware: string[];
  validation: "manual" | "hono-zod";
  openapi: boolean;
}
