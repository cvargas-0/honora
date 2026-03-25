import { z } from 'zod';

export const databaseSchema = z
    .enum(['sqlite', 'postgres', 'mysql'])
    .describe('The database driver to use');

export const databaseORMSchema = z
    .enum(['drizzle', 'prisma'])
    .describe('The database ORM to use');

export const ServerSchema = z
    .enum(['hono'])
    .describe('The server framework to use');

export const MiddlewareSchema = z
    .array(z.enum(['cors', 'logger']))
    .describe('The middlewares to use');

export const ValidationSchema = z
    .enum(['manual', 'hono-zod'])
    .describe('The validation strategy to use');

export const OpenapiSchema = z
    .boolean()
    .describe('Whether to generate OpenAPI docs');

export const LangSchema = z
    .enum(['ts', 'js'])
    .describe('The language to use');