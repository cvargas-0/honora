import type { OrmAdapter, GeneratedFile, AdapterDependencies, Collection, DatabaseConfig, GeneratorContext } from "@honora/types";
import { generatePrismaSchema } from "./prisma-schema";
import { generatePrismaClient } from "./prisma-client";
import { generatePrismaFilterParser } from "./filter-parser";
import { generatePrismaRoute } from "./routes";

export const prismaAdapter: OrmAdapter = {
  name: "prisma",

  generateSchema(collections: Collection[], ctx: GeneratorContext): GeneratedFile[] {
    return [{ relativePath: "prisma/schema.prisma", content: generatePrismaSchema(collections, ctx) }];
  },

  generateClient(_database: DatabaseConfig, ctx: GeneratorContext): GeneratedFile[] {
    const ext = ctx.lang === "ts" ? ".ts" : ".js";
    return [{ relativePath: `src/db/client${ext}`, content: generatePrismaClient(ctx) }];
  },

  generateFilterParser(ctx: GeneratorContext): GeneratedFile[] {
    const ext = ctx.lang === "ts" ? ".ts" : ".js";
    return [{ relativePath: `src/utils/filter-parser${ext}`, content: generatePrismaFilterParser(ctx) }];
  },

  generateRoute(collection: Collection, ctx: GeneratorContext): GeneratedFile[] {
    const ext = ctx.lang === "ts" ? ".ts" : ".js";
    return [{ relativePath: `src/routes/${collection.name}${ext}`, content: generatePrismaRoute(collection, ctx) }];
  },

  generateConfig(_database: DatabaseConfig, _ctx: GeneratorContext): GeneratedFile[] {
    return [];
  },

  getDependencies(_ctx: GeneratorContext): AdapterDependencies {
    return {
      dependencies: {
        "@prisma/client": "^6.9.0",
      },
      devDependencies: {
        prisma: "^6.9.0",
      },
      scripts: {
        "db:generate": "prisma generate",
        "db:migrate": "prisma migrate dev",
        "db:push": "prisma db push",
        "db:studio": "prisma studio",
      },
    };
  },
};
