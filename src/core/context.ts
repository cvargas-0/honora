export interface GeneratorContext {
  lang: "ts" | "js";
  driver: "sqlite" | "postgres" | "mysql";
  orm: "drizzle" | "prisma";
  middleware: string[];
  validation: "manual" | "hono-zod";
  openapi: boolean;
}
