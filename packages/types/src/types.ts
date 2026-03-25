import { z } from 'zod';
import { databaseSchema, databaseORMSchema, ServerSchema, MiddlewareSchema, ValidationSchema, OpenapiSchema, LangSchema } from './schemas';

export type DatabaseConfig = z.infer<typeof databaseSchema>;
export type DatabaseORMConfig = z.infer<typeof databaseORMSchema>;
export type ServerConfig = z.infer<typeof ServerSchema>;
export type MiddlewareConfig = z.infer<typeof MiddlewareSchema>;
export type ValidationConfig = z.infer<typeof ValidationSchema>;
export type OpenapiConfig = z.infer<typeof OpenapiSchema>;
export type LangConfig = z.infer<typeof LangSchema>;

