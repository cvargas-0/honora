"use client";

import { useState } from "react";
import { Check, Copy, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type SchemaConfig } from "@/lib/schema-types";

type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

const PKG_MANAGERS: { value: PackageManager; label: string }[] = [
  { value: "npm", label: "npm" },
  { value: "pnpm", label: "pnpm" },
  { value: "yarn", label: "yarn" },
  { value: "bun", label: "bun" },
];

function getRunner(pm: PackageManager): string {
  switch (pm) {
    case "npm":
      return "npx create-honora";
    case "pnpm":
      return "pnpm create honora";
    case "yarn":
      return "yarn create honora";
    case "bun":
      return "bun create honora";
  }
}

interface CLICommandProps {
  schema: SchemaConfig;
  fileName: string;
}

function generateCLICommand(schema: SchemaConfig, pm: PackageManager, fileName: string): string {
  const name = schema.projectName.trim();
  const safeName = name ? (/\s/.test(name) ? `"${name}"` : name) : "my-api";
  return `${getRunner(pm)} ${safeName} --schema ${fileName}.json`;
}

export function CLICommand({ schema, fileName }: CLICommandProps) {
  const [pm, setPm] = useState<PackageManager>("npm");
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const command = generateCLICommand(schema, pm, fileName);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="font-mono text-sm text-muted-foreground">CLI</span>
        <div className="flex items-center gap-1">
          {/* Package manager picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-secondary/50 px-2 font-mono text-xs text-foreground transition-colors hover:bg-secondary"
            >
              {pm}
              <ChevronDown
                className={cn(
                  "size-3 text-muted-foreground transition-transform duration-200",
                  open && "rotate-180",
                )}
              />
            </button>
            {open && (
              <div className="animate-in fade-in zoom-in-95 slide-in-from-top-1 absolute right-0 top-full z-10 mt-1 min-w-20 overflow-hidden rounded-md border border-border bg-popover shadow-md duration-150">
                {PKG_MANAGERS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setPm(value);
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 font-mono text-xs transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    {value === pm && <Check className="size-3 shrink-0" />}
                    <span className={value === pm ? "" : "ml-5"}>{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 gap-1.5 text-xs"
          >
            {copied ? (
              <>
                <Check className="size-3.5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>
      <div className="px-4 py-3">
        <pre className="overflow-x-auto whitespace-pre-wrap break-all font-mono text-sm leading-relaxed text-foreground">
          <code>{command}</code>
        </pre>
      </div>
    </div>
  );
}
