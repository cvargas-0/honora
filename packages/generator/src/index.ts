import { drizzleAdapter } from "./adapters/drizzle/index.js";
import { prismaAdapter } from "./adapters/prisma/index.js";
import { registerAdapter } from "./adapters/registry.js";

// Register built-in adapters on import
registerAdapter(drizzleAdapter);
registerAdapter(prismaAdapter);

export { loadSchema } from "./schema-loader.js";
export { generateProject } from "./project.js";
export { registerAdapter, getRegisteredAdapters } from "./adapters/registry.js";
