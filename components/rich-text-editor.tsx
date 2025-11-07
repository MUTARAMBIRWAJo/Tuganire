"use client"

import { useEffect, useRef } from "react"
import { Label } from "@/components/ui/label"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
}

export function RichTextEditor({ value, onChange, label, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="border rounded-lg overflow-hidden bg-white">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-1 p-2 border-b bg-slate-50">
          <button
            type="button"
            onClick={() => execCommand("bold")}
            className="px-3 py-1 rounded hover:bg-slate-200 font-bold"
            title="Bold"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => execCommand("italic")}
            className="px-3 py-1 rounded hover:bg-slate-200 italic"
            title="Italic"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => execCommand("underline")}
            className="px-3 py-1 rounded hover:bg-slate-200 underline"
            title="Underline"
          >
            U
          </button>
          <div className="w-px bg-slate-300 mx-1" />
          <button
            type="button"
            onClick={() => execCommand("formatBlock", "<h2>")}
            className="px-3 py-1 rounded hover:bg-slate-200 text-sm"
            title="Heading 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => execCommand("formatBlock", "<h3>")}
            className="px-3 py-1 rounded hover:bg-slate-200 text-sm"
            title="Heading 3"
          >
            H3
          </button>
          <button
            type="button"
            onClick={() => execCommand("formatBlock", "<p>")}
            className="px-3 py-1 rounded hover:bg-slate-200 text-sm"
            title="Paragraph"
          >
            P
          </button>
          <div className="w-px bg-slate-300 mx-1" />
          <button
            type="button"
            onClick={() => execCommand("insertUnorderedList")}
            className="px-3 py-1 rounded hover:bg-slate-200"
            title="Bullet List"
          >
            • List
          </button>
          <button
            type="button"
            onClick={() => execCommand("insertOrderedList")}
            className="px-3 py-1 rounded hover:bg-slate-200"
            title="Numbered List"
          >
            1. List
          </button>
          <div className="w-px bg-slate-300 mx-1" />
          <button
            type="button"
            onClick={() => execCommand("createLink", prompt("Enter URL:") || "")}
            className="px-3 py-1 rounded hover:bg-slate-200"
            title="Insert Link"
          >
            🔗
          </button>
        </div>

        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          className="min-h-[300px] p-4 focus:outline-none prose prose-sm max-w-none"
          data-placeholder={placeholder}
          suppressContentEditableWarning
        />
      </div>
    </div>
  )
}
