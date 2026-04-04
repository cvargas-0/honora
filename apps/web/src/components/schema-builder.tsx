"use client";

import { useState, useCallback, useRef, useId } from "react";
import { Plus, RotateCcw, Upload, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlobalConfig } from "@/components/global-config";
import { CollectionEditor } from "@/components/collection-editor";
import { JSONPreview } from "@/components/json-preview";
import { CLICommand } from "@/components/cli-command";
import {
  type SchemaConfig,
  type Collection,
  type SchemaField,
} from "@/lib/schema-types";

function generateId() {
  return Math.random().toString(36).substring(2, 11);
}

function createEmptyField(): SchemaField {
  return {
    id: generateId(),
    name: "",
    type: "text",
    required: false,
    unique: false,
  };
}

function createEmptyCollection(): Collection {
  return {
    id: generateId(),
    name: "",
    methods: [],
    fields: [createEmptyField()],
  };
}

function createInitialSchema(): SchemaConfig {
  return {
    projectName: "",
    database: { driver: "", url: "" },
    middleware: [],
    openapi: { enabled: false },
    collections: [createEmptyCollection()],
  };
}

export function SchemaBuilder() {
  const [schema, setSchema] = useState<SchemaConfig>(() =>
    createInitialSchema(),
  );
  const [fileName, setFileName] = useState("schema");
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uniqueId = useId();

  const handleProjectNameChange = useCallback((value: string) => {
    setSchema((prev) => ({ ...prev, projectName: value }));
  }, []);

  const handleConfigChange = useCallback((config: SchemaConfig) => {
    setSchema(config);
  }, []);

  const handleCollectionChange = useCallback(
    (index: number, collection: Collection) => {
      setSchema((prev) => {
        const newCollections = [...prev.collections];
        newCollections[index] = collection;
        return { ...prev, collections: newCollections };
      });
    },
    [],
  );

  const handleAddCollection = useCallback(() => {
    setSchema((prev) => ({
      ...prev,
      collections: [...prev.collections, createEmptyCollection()],
    }));
  }, []);

  const handleRemoveCollection = useCallback((index: number) => {
    setSchema((prev) => ({
      ...prev,
      collections: prev.collections.filter((_, i) => i !== index),
    }));
  }, []);

  const handleReset = useCallback(() => {
    setSchema(createInitialSchema());
  }, []);

  const handleImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          const importedSchema: SchemaConfig = {
            projectName: json.projectName || "",
            database: {
              driver: json.database?.driver || "",
              url: json.database?.url || "",
            },
            middleware: json.middleware || [],
            openapi: { enabled: json.openapi === true },
            collections: (json.collections || []).map(
              (col: {
                name?: string;
                methods?: string[];
                fields?: Array<{
                  name?: string;
                  type?: string;
                  required?: boolean;
                  unique?: boolean;
                  collection?: string;
                }>;
              }) => ({
                id: generateId(),
                name: col.name || "",
                methods: col.methods || [],
                fields: (col.fields || []).map(
                  (field: {
                    name?: string;
                    type?: string;
                    required?: boolean;
                    unique?: boolean;
                    collection?: string;
                  }) => ({
                    id: generateId(),
                    name: field.name || "",
                    type: field.type || "text",
                    required: field.required || false,
                    unique: field.unique || false,
                    relationCollection: field.collection,
                  }),
                ),
              }),
            ),
          };
          setSchema(importedSchema);
        } catch {
          alert("Invalid JSON file");
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [],
  );

  const collectionNames = schema.collections.map((c) => c.name).filter(Boolean);

  return (
    <div className="grid h-[calc(100vh-80px)] gap-6 lg:grid-cols-2">
      {/* Left panel: form */}
      <div className="flex flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto pr-2">
          {/* Project name */}
          <div>
            <Label
              htmlFor="project-name"
              className="mb-1.5 block text-xs text-muted-foreground"
            >
              Project Name
            </Label>
            <Input
              id="project-name"
              placeholder="my-api"
              value={schema.projectName}
              onChange={(e) => handleProjectNameChange(e.target.value)}
              className="font-mono"
            />
          </div>

          <GlobalConfig config={schema} onChange={handleConfigChange} />

          {/* Collections */}
          <div>
            <div className="mb-3 flex items-center justify-end gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleImport}
                className="gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <Upload className="size-3.5" />
                Import JSON
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="size-3.5" />
                Reset
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobilePreview(!showMobilePreview)}
                className="gap-1.5 text-muted-foreground hover:text-foreground lg:hidden"
              >
                {showMobilePreview ? (
                  <EyeOff className="size-3.5" />
                ) : (
                  <Eye className="size-3.5" />
                )}
                Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddCollection}
                className="gap-1.5"
              >
                <Plus className="size-3.5" />
                Add Collection
              </Button>
            </div>

            <div className="space-y-3">
              {schema.collections.map((collection, index) => (
                <CollectionEditor
                  key={collection.id}
                  collection={collection}
                  collectionNames={collectionNames}
                  onChange={(c) => handleCollectionChange(index, c)}
                  onRemove={() => handleRemoveCollection(index)}
                  canRemove={schema.collections.length > 1}
                  idPrefix={`${uniqueId}-col-${index}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel: preview + CLI command */}
      <div
        className="hidden flex-col gap-4 lg:flex"
        style={{ height: "calc(100vh - 80px)" }}
      >
        <CLICommand schema={schema} fileName={fileName} />
        <div className="min-h-0 flex-1">
          <JSONPreview schema={schema} fileName={fileName} onFileNameChange={setFileName} />
        </div>
      </div>

      {/* Mobile preview overlay */}
      {showMobilePreview && (
        <div className="fixed inset-0 z-50 flex flex-col gap-4 bg-background p-4 lg:hidden">
          <div className="min-h-0 flex-1">
            <JSONPreview schema={schema} fileName={fileName} onFileNameChange={setFileName} />
          </div>
          <CLICommand schema={schema} fileName={fileName} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMobilePreview(false)}
            className="shrink-0"
          >
            Close
          </Button>
        </div>
      )}
    </div>
  );
}
