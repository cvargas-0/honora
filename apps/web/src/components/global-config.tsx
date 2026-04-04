"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
  type SchemaConfig,
  DRIVER_OPTIONS,
  MIDDLEWARE_OPTIONS,
} from "@/lib/schema-types";

interface GlobalConfigProps {
  config: SchemaConfig;
  onChange: (config: SchemaConfig) => void;
}

export function GlobalConfig({ config, onChange }: GlobalConfigProps) {
  const [isOpen, setIsOpen] = useState(true);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDriverChange = (value: string | null, _event?: unknown) => {
    if (value === null) return;
    onChange({
      ...config,
      database: {
        ...config.database,
        driver: value as SchemaConfig["database"]["driver"],
      },
    });
  };

  const handleUrlChange = (value: string) => {
    onChange({
      ...config,
      database: { ...config.database, url: value },
    });
  };

  const toggleMiddleware = (middleware: string) => {
    const newMiddleware = config.middleware.includes(middleware)
      ? config.middleware.filter((m) => m !== middleware)
      : [...config.middleware, middleware];
    onChange({ ...config, middleware: newMiddleware });
  };

  const handleOpenAPIChange = (enabled: boolean) => {
    onChange({ ...config, openapi: { enabled } });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <CollapsibleTrigger className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/50">
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180",
            )}
          />
          <span className="flex-1 text-left font-medium">
            Global Configuration
          </span>
          <span className="text-xs text-muted-foreground">Optional</span>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="animate-in fade-in slide-in-from-top-2 space-y-4 border-t border-border px-4 py-4 duration-200">
            {/* Database: driver + URL on same row */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label
                  className="mb-1.5 block text-xs text-muted-foreground"
                  htmlFor="global-driver"
                >
                  Driver
                </Label>
                <Select
                  value={config.database.driver || ""}
                  onValueChange={handleDriverChange}
                >
                  <SelectTrigger
                    id="global-driver"
                    className="w-full bg-background font-mono"
                  >
                    <SelectValue placeholder="Select driver..." />
                  </SelectTrigger>
                  <SelectContent>
                    {DRIVER_OPTIONS.map((driver) => (
                      <SelectItem
                        key={driver}
                        value={driver}
                        className="font-mono"
                      >
                        {driver}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label
                  htmlFor="global-db-url"
                  className="mb-1.5 block text-xs text-muted-foreground"
                >
                  Database URL
                </Label>
                <Input
                  id="global-db-url"
                  placeholder="postgresql://..."
                  value={config.database.url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="bg-background font-mono text-sm"
                />
              </div>
            </div>

            {/* Middleware */}
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">
                Middleware
              </Label>
              <div className="flex flex-wrap gap-2">
                {MIDDLEWARE_OPTIONS.map((middleware) => (
                  <button
                    key={middleware}
                    type="button"
                    onClick={() => toggleMiddleware(middleware)}
                    className={cn(
                      "inline-flex h-8 items-center rounded-md border px-3 font-mono text-xs transition-colors",
                      config.middleware.includes(middleware)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    {middleware}
                  </button>
                ))}
              </div>
            </div>

            {/* OpenAPI */}
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">OpenAPI</Label>
              <Switch
                checked={config.openapi.enabled}
                onCheckedChange={handleOpenAPIChange}
              />
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
