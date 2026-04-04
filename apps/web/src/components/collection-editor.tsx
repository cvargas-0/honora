'use client'

import { useState } from 'react'
import { ChevronDown, Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { FieldEditor } from '@/components/field-editor'
import { cn } from '@/lib/utils'
import { type Collection, type SchemaField, METHOD_OPTIONS } from '@/lib/schema-types'

function generateId() {
  return Math.random().toString(36).substring(2, 11)
}

function createEmptyField(): SchemaField {
  return {
    id: generateId(),
    name: '',
    type: 'text',
    required: false,
    unique: false,
  }
}

interface CollectionEditorProps {
  collection: Collection
  collectionNames: string[]
  onChange: (collection: Collection) => void
  onRemove: () => void
  canRemove: boolean
  idPrefix: string
}

export function CollectionEditor({
  collection,
  collectionNames,
  onChange,
  onRemove,
  canRemove,
  idPrefix,
}: CollectionEditorProps) {
  const [isOpen, setIsOpen] = useState(true)

  const handleNameChange = (value: string) => {
    onChange({ ...collection, name: value })
  }

  const toggleMethod = (method: string) => {
    const newMethods = collection.methods.includes(method)
      ? collection.methods.filter((m) => m !== method)
      : [...collection.methods, method]
    onChange({ ...collection, methods: newMethods })
  }

  const handleFieldChange = (index: number, field: SchemaField) => {
    const newFields = [...collection.fields]
    newFields[index] = field
    onChange({ ...collection, fields: newFields })
  }

  const handleAddField = () => {
    onChange({
      ...collection,
      fields: [...collection.fields, createEmptyField()],
    })
  }

  const handleRemoveField = (index: number) => {
    const newFields = collection.fields.filter((_, i) => i !== index)
    onChange({ ...collection, fields: newFields })
  }

  const availableRelationCollections = collectionNames.filter(
    (name) => name !== collection.name && name.trim() !== ''
  )

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="animate-in fade-in slide-in-from-bottom-1 overflow-hidden rounded-lg border border-border bg-card duration-300">
        <div className="flex items-center">
          <CollapsibleTrigger className="flex flex-1 cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/50">
            <ChevronDown
              className={cn(
                'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
            />
            <span className={cn('flex-1 font-medium', !collection.name && 'italic text-muted-foreground')}>
              {collection.name || 'Unnamed Collection'}
            </span>
            <div className="flex items-center gap-2">
              {collection.methods.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {collection.methods.length} methods
                </Badge>
              )}
              {collection.fields.filter((f) => f.name).length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {collection.fields.filter((f) => f.name).length} fields
                </Badge>
              )}
            </div>
          </CollapsibleTrigger>
          <div className="px-2">
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

        <CollapsibleContent>
          <div className="animate-in fade-in slide-in-from-top-2 border-t border-border px-4 py-4 duration-200">
            <div className="space-y-5">
              <div>
                <Label className="mb-1.5 block text-sm text-muted-foreground">
                  Collection Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="users"
                  value={collection.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="font-mono"
                />
              </div>

              <div>
                <Label className="mb-2 block text-sm text-muted-foreground">HTTP Methods <span className="font-normal opacity-60">(empty = all)</span></Label>
                <div className="flex flex-wrap gap-2">
                  {METHOD_OPTIONS.map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => toggleMethod(method)}
                      className={cn(
                        'rounded-md border px-3 py-1.5 font-mono text-xs transition-colors',
                        collection.methods.includes(method)
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
                      )}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <Label className="text-sm text-muted-foreground">Fields</Label>
                  <Button variant="ghost" size="sm" onClick={handleAddField} className="h-7 gap-1 text-xs">
                    <Plus className="size-3.5" />
                    Add Field
                  </Button>
                </div>
                <div className="space-y-2">
                  {collection.fields.map((field, index) => (
                    <FieldEditor
                      key={field.id}
                      field={field}
                      collectionNames={availableRelationCollections}
                      onChange={(f) => handleFieldChange(index, f)}
                      onRemove={() => handleRemoveField(index)}
                      canRemove={collection.fields.length > 1}
                      idPrefix={`${idPrefix}-field-${index}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
