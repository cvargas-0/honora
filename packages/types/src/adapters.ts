import type { Collection, DatabaseConfig, GeneratorContext } from "./types";

/** A single file produced by an ORM adapter. */
export interface GeneratedFile {
  relativePath: string;
  content: string;
}

/** Dependency groups an ORM adapter injects into the generated package.json. */
export interface AdapterDependencies {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
}

/** Contract every ORM adapter must implement. */
export interface OrmAdapter {
  readonly name: string;
  generateSchema(collections: Collection[], ctx: GeneratorContext): GeneratedFile[];
  generateClient(database: DatabaseConfig, ctx: GeneratorContext): GeneratedFile[];
  generateFilterParser(ctx: GeneratorContext): GeneratedFile[];
  generateRoute(collection: Collection, ctx: GeneratorContext): GeneratedFile[];
  generateConfig(database: DatabaseConfig, ctx: GeneratorContext): GeneratedFile[];
  getDependencies(ctx: GeneratorContext): AdapterDependencies;
}
