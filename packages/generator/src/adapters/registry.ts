import type { OrmAdapter } from "@honora/types";

const adapters = new Map<string, OrmAdapter>();

export function registerAdapter(adapter: OrmAdapter): void {
  adapters.set(adapter.name, adapter);
}

export function getAdapter(name: string): OrmAdapter {
  const adapter = adapters.get(name);
  if (!adapter) {
    throw new Error(`ORM adapter "${name}" not found. Registered: ${[...adapters.keys()].join(", ")}`);
  }
  return adapter;
}

export function getRegisteredAdapters(): string[] {
  return [...adapters.keys()];
}
