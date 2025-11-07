"use client"

import type React from "react"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface MediaUploadProps {
  userId: string
}

export function MediaUpload({ userId }: MediaUploadProps) {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [altText, setAltText] = useState("")
  const [caption, setCaption] = useState("")

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)

    const supabases = supabase

    try {
      // For this demo, we'll store file metadata without actual file upload
      // In production, you would upload to Supabase Storage or another service

      const { error: insertError } = await supabases.from("media").insert({
        filename: file.name.replace(/[^a-zA-Z0-9.-]/g, "_"),
        original_filename: file.name,
        file_path: `/uploads/${file.name}`,
        file_size: file.size,
        mime_type: file.type,
        alt_text: altText || null,
        caption: caption || null,
        uploaded_by: userId,
      })

      if (insertError) throw insertError

      // Reset form
      setAltText("")
      setCaption("")
      e.target.value = ""

      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="altText">Alt Text (Optional)</Label>
        <Input
          id="altText"
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          placeholder="Describe the image for accessibility"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="caption">Caption (Optional)</Label>
        <Input id="caption" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Add a caption" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="file">Select File</Label>
        <div className="flex items-center gap-4">
          <Input
            id="file"
            type="file"
            onChange={handleFileUpload}
            disabled={isUploading}
            accept="image/*,video/*,application/pdf"
          />
          {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="rounded-md bg-blue-50 p-3">
        <p className="text-sm text-blue-600">
          <strong>Note:</strong> This is a demo implementation. In production, files would be uploaded to Supabase
          Storage or a CDN.
        </p>
      </div>
    </div>
  )
}
