'use client'

import { useState, useRef, useEffect } from 'react'
import { Check, Copy, CheckCircle2, AlertCircle, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { type SchemaConfig, schemaToJSON, validateSchema } from '@/lib/schema-types'

interface JSONPreviewProps {
  schema: SchemaConfig
  fileName: string
  onFileNameChange: (name: string) => void
}

function syntaxHighlight(json: string): string {
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = 'text-[#79c0ff]'
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'text-[#7ee787]'
        } else {
          cls = 'text-[#a5d6ff]'
        }
      } else if (/true|false/.test(match)) {
        cls = 'text-[#ff7b72]'
      } else if (/null/.test(match)) {
        cls = 'text-[#8b949e]'
      }
      return `<span class="${cls}">${match}</span>`
    }
  )
}

export function JSONPreview({ schema, fileName, onFileNameChange }: JSONPreviewProps) {
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(fileName)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when entering edit mode
  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  const jsonOutput = JSON.stringify(schemaToJSON(schema), null, 2)
  const errors = validateSchema(schema)
  const isValid = errors.length === 0

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonOutput)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([jsonOutput], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${fileName}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const commitEdit = () => {
    // Strip any .json suffix the user may have typed, trim whitespace
    const normalized = draft.replace(/\.json$/i, '').trim()
    onFileNameChange(normalized || 'schema')
    setEditing(false)
  }

  const highlightedJSON = syntaxHighlight(jsonOutput)

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          {editing ? (
            <div className="flex items-center font-mono text-sm text-muted-foreground">
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitEdit()
                  if (e.key === 'Escape') { setDraft(fileName); setEditing(false) }
                }}
                className="w-28 min-w-0 border-b border-border bg-transparent font-mono text-sm text-foreground outline-none"
                spellCheck={false}
              />
              <span className="text-muted-foreground">.json</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => { setDraft(fileName); setEditing(true) }}
              className="font-mono text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              title="Click to rename"
            >
              {fileName}.json
            </button>
          )}
          <div
            className={cn(
              'flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
              isValid ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
            )}
          >
            {isValid ? (
              <>
                <CheckCircle2 className="size-3" />
                Valid
              </>
            ) : (
              <>
                <AlertCircle className="size-3" />
                {errors.length} {errors.length === 1 ? 'issue' : 'issues'}
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 gap-1.5 text-xs">
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
          <Button variant="outline" size="sm" onClick={handleDownload} className="h-8 gap-1.5 text-xs">
            <Download className="size-3.5" />
            Download
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <pre className="font-mono text-sm leading-relaxed">
          <code dangerouslySetInnerHTML={{ __html: highlightedJSON }} />
        </pre>
      </div>
      {!isValid && (
        <div className="border-t border-border bg-warning/5 px-4 py-3">
          <ul className="space-y-1 text-sm text-warning">
            {errors.map((error: string, index: number) => (
              <li key={index} className="flex items-center gap-2">
                <AlertCircle className="size-3.5 shrink-0" />
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
