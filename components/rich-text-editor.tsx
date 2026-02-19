"use client"

import { useEffect, useRef } from "react"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabaseClient"

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

  const ensureBucket = async (bucket: string) => {
    const res = await fetch("/api/storage/ensure-bucket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bucket, public: true }),
    })
    if (!res.ok) throw new Error("Failed to ensure bucket")
  }

  const uploadFile = async (file: File): Promise<{ url: string; kind: "image" | "video" }> => {
    const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET || "media"
    await ensureBucket(BUCKET)
    const isImage = file.type.startsWith("image/")
    const isVideo = file.type.startsWith("video/")
    if (!isImage && !isVideo) throw new Error("Unsupported file type")
    const max = isImage ? 20 * 1024 * 1024 : 50 * 1024 * 1024
    if (file.size > max) throw new Error("File too large")
    const fileExt = file.name.split(".").pop()
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
    const filePath = `articles/${fileName}`
    const { error } = await supabase.storage.from(BUCKET).upload(filePath, file, { cacheControl: "3600", upsert: false })
    if (error) throw error
    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(filePath)
    return { url: publicUrl, kind: isImage ? "image" : "video" }
  }

  const insertHtmlAtCursor = (html: string) => {
    editorRef.current?.focus()
    document.execCommand("insertHTML", false, html)
    handleInput()
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
          <div className="w-px bg-slate-300 mx-1" />
          <input
            id="rte-insert-image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0]
              if (!f) return
              try {
                const up = await uploadFile(f)
                if (up.kind === "image") {
                  insertHtmlAtCursor(`<img src="${up.url}" alt="" />`)
                }
              } finally {
                ;(e.target as HTMLInputElement).value = ""
              }
            }}
          />
          <label htmlFor="rte-insert-image" className="px-3 py-1 rounded hover:bg-slate-200 cursor-pointer" title="Insert Image">🖼️</label>
          <input
            id="rte-insert-video"
            type="file"
            accept="video/mp4,video/webm"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0]
              if (!f) return
              try {
                const up = await uploadFile(f)
                if (up.kind === "video") {
                  insertHtmlAtCursor(`<video src="${up.url}" controls></video>`)
                }
              } finally {
                ;(e.target as HTMLInputElement).value = ""
              }
            }}
          />
          <label htmlFor="rte-insert-video" className="px-3 py-1 rounded hover:bg-slate-200 cursor-pointer" title="Insert Video">🎬</label>
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
