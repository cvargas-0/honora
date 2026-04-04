"use client";

import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type SchemaField,
  type FieldType,
  FIELD_TYPES,
} from "@/lib/schema-types";

interface FieldEditorProps {
  field: SchemaField;
  collectionNames: string[];
  onChange: (field: SchemaField) => void;
  onRemove: () => void;
  canRemove: boolean;
  idPrefix: string;
}

export function FieldEditor({
  field,
  collectionNames,
  onChange,
  onRemove,
  canRemove,
  idPrefix,
}: FieldEditorProps) {
  const handleNameChange = (value: string) => {
    onChange({ ...field, name: value });
  };

  const handleTypeChange = (value: FieldType) => {
    onChange({
      ...field,
      type: value,
      relationCollection: value === "relation" ? "" : undefined,
    });
  };

  const handleRequiredChange = (checked: boolean) => {
    onChange({ ...field, required: checked });
  };

  const handleUniqueChange = (checked: boolean) => {
    onChange({ ...field, unique: checked });
  };

  const handleRelationChange = (value: string | null) => {
    onChange({ ...field, relationCollection: value || "" });
  };

  const requiredId = `${idPrefix}-required`;
  const uniqueId = `${idPrefix}-unique`;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-1 group flex flex-wrap items-start gap-3 rounded-md border border-border/50 bg-secondary/30 p-3 duration-200 transition-colors hover:border-border">
      <div className="min-w-35 flex-1">
        <Label className="mb-1.5 block text-xs text-muted-foreground">
          Field Name
        </Label>
        <Input
          placeholder="field_name"
          value={field.name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="h-8 bg-background font-mono text-sm"
        />
      </div>

      <div className="w-32.5">
        <Label className="mb-1.5 block text-xs text-muted-foreground">
          Type
        </Label>
        <Select
          value={field.type}
          onValueChange={(v) => handleTypeChange(v as FieldType)}
        >
          <SelectTrigger className="h-8 bg-background font-mono text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FIELD_TYPES.map((type) => (
              <SelectItem key={type} value={type} className="font-mono">
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {field.type === "relation" && (
        <div className="w-40">
          <Label className="mb-1.5 block text-xs text-muted-foreground">
            Relates to
          </Label>
          <Select
            value={field.relationCollection || ""}
            onValueChange={handleRelationChange}
          >
            <SelectTrigger className="h-8 bg-background font-mono text-sm">
              <SelectValue placeholder="Choose collection..." />
            </SelectTrigger>
            <SelectContent>
              {collectionNames.length === 0 ? (
                <SelectItem
                  value="_none"
                  disabled
                  className="font-mono text-muted-foreground"
                >
                  No other collections defined
                </SelectItem>
              ) : (
                collectionNames.map((name) => (
                  <SelectItem key={name} value={name} className="font-mono">
                    {name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex items-center gap-4 pt-6">
        <div className="flex items-center gap-2">
          <Checkbox
            id={requiredId}
            checked={field.required}
            onCheckedChange={(checked) =>
              handleRequiredChange(checked as boolean)
            }
          />
          <Label htmlFor={requiredId} className="cursor-pointer text-xs">
            Required
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id={uniqueId}
            checked={field.unique}
            onCheckedChange={(checked) =>
              handleUniqueChange(checked as boolean)
            }
          />
          <Label htmlFor={uniqueId} className="cursor-pointer text-xs">
            Unique
          </Label>
        </div>
      </div>

      <div className="pt-5">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          disabled={!canRemove}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}
