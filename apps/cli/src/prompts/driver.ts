import * as p from "@clack/prompts";
import { cancelled, type Driver } from "./utils";

export async function promptDriver(flagValue?: Driver): Promise<Driver> {
  if (flagValue) return flagValue;

  const result = await p.select({
    message: "Database",
    initialValue: "sqlite" as const,
    options: [
      { value: "sqlite" as const, label: "SQLite" },
      { value: "postgres" as const, label: "PostgreSQL" },
      { value: "mysql" as const, label: "MySQL" },
    ],
  });
  if (p.isCancel(result)) cancelled();
  return result;
}
