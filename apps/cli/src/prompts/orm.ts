import * as p from "@clack/prompts";
import { cancelled, type Orm } from "./utils";

export async function promptOrm(flagValue?: Orm): Promise<Orm> {
  if (flagValue) return flagValue;

  const result = await p.select({
    message: "ORM",
    initialValue: "drizzle" as const,
    options: [
      { value: "drizzle" as const, label: "Drizzle ORM" },
      { value: "prisma" as const, label: "Prisma" },
    ],
  });
  if (p.isCancel(result)) cancelled();
  return result;
}
