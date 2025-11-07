"use client"

import type React from "react"

import { useState, useRef } from "react"
import { supabase} from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X, Star, Video } from "lucide-react"
import type { MediaItem } from "@/lib/types"

interface MediaUploaderProps {
  media: MediaItem[]
  onChange: (media: MediaItem[]) => void
  featuredImage: string | null
  onFeaturedChange: (url: string) => void
}

export function MediaUploader({ media, onChange, featuredImage, onFeaturedChange }: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabases = supabase
  const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET || "media"

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Ensure bucket exists (server will create if missing)
    try {
      const response = await fetch("/api/storage/ensure-bucket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bucket: BUCKET, public: true }),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || `Failed to ensure bucket: ${response.statusText}`)
      }
      
      const result = await response.json()
      if (!result.ok) {
        throw new Error(result.error || "Failed to ensure bucket exists")
      }
    } catch (err) {
      console.error("Failed to ensure bucket exists:", err)
      alert(`Failed to prepare storage: ${err instanceof Error ? err.message : "Unknown error"}`)
      setUploading(false)
      return
    }

    setUploading(true)

    for (const file of Array.from(files)) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"]
      if (!validTypes.includes(file.type)) {
        alert(`Invalid file type: ${file.name}. Only images and videos are allowed.`)
        continue
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File too large: ${file.name}. Maximum size is 10MB.`)
        continue
      }

      try {
        // Create unique filename
        const fileExt = file.name.split(".").pop()
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
        const filePath = `articles/${fileName}`

        // Upload to Supabase Storage
        const { data, error } = await supabases.storage.from(BUCKET).upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })

        if (error) {
          if (error.message?.includes("Bucket not found") || error.message?.includes("bucket")) {
            throw new Error(`Storage bucket "${BUCKET}" not found. Please ensure the bucket exists in your Supabase project.`)
          }
          throw error
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabases.storage.from(BUCKET).getPublicUrl(filePath)

        // Add to media array
        const newMediaItem: MediaItem = {
          url: publicUrl,
          type: file.type.startsWith("image/") ? "image" : "video",
          alt: file.name,
          isFeatured: media.length === 0, // First image is featured by default
        }

        const updatedMedia = [...media, newMediaItem]
        onChange(updatedMedia)

        // Set as featured if it's the first image
        if (media.length === 0 && newMediaItem.type === "image") {
          onFeaturedChange(publicUrl)
        }
        
        // Show success message
        setUploadSuccess(`Successfully uploaded ${file.name}`)
        setTimeout(() => setUploadSuccess(null), 3000)
      } catch (error) {
        console.error("Upload error:", error)
        const errorMsg = error instanceof Error ? error.message : `Failed to upload ${file.name}`
        alert(errorMsg)
      }
    }

    setUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeMedia = (index: number) => {
    const updatedMedia = media.filter((_, i) => i !== index)
    onChange(updatedMedia)

    // If removed item was featured, set first image as featured
    if (media[index].url === featuredImage && updatedMedia.length > 0) {
      const firstImage = updatedMedia.find((m) => m.type === "image")
      if (firstImage) {
        onFeaturedChange(firstImage.url)
      }
    }
  }

  const setFeatured = (url: string) => {
    onFeaturedChange(url)
    const updatedMedia = media.map((m) => ({
      ...m,
      isFeatured: m.url === url,
    }))
    onChange(updatedMedia)
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Media Upload</Label>
        <p className="text-sm text-slate-600 mt-1">
          Upload images and videos (max 10MB each). Click the star to set featured image.
        </p>
      </div>

      {/* Upload Button */}
      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="media-upload"
        />
        <label htmlFor="media-upload" className="cursor-pointer">
          <Upload className="h-10 w-10 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700">Click to upload or drag and drop</p>
          <p className="text-xs text-slate-500 mt-1">Images: JPEG, PNG, WebP • Videos: MP4, WebM • Max 10MB</p>
        </label>
      </div>

      {/* Media Grid */}
      {media.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {media.map((item, index) => (
            <div key={index} className="relative group rounded-lg overflow-hidden border-2 border-slate-200">
              {item.type === "image" ? (
                <img
                  src={item.url || "/placeholder.svg"}
                  alt={item.alt || "Uploaded media"}
                  className="w-full h-32 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg"
                  }}
                  onLoad={() => {
                    // Image loaded successfully
                  }}
                />
              ) : (
                <div className="w-full h-32 bg-slate-100 flex items-center justify-center">
                  <Video className="h-8 w-8 text-slate-400" />
                </div>
              )}

              {/* Overlay Controls */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {item.type === "image" && (
                  <Button
                    type="button"
                    size="sm"
                    variant={item.url === featuredImage ? "default" : "secondary"}
                    onClick={() => setFeatured(item.url)}
                    className="h-8 w-8 p-0"
                  >
                    <Star className={`h-4 w-4 ${item.url === featuredImage ? "fill-current" : ""}`} />
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => removeMedia(index)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Featured Badge */}
              {item.url === featuredImage && (
                <div className="absolute top-2 left-2 bg-orange-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  Featured
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <div className="text-center text-sm text-slate-600 p-2 bg-blue-50 rounded">
          <Upload className="h-4 w-4 inline mr-2 animate-pulse" />
          Uploading...
        </div>
      )}
      
      {uploadSuccess && (
        <div className="text-center text-sm text-green-700 p-2 bg-green-50 rounded border border-green-200">
          ✓ {uploadSuccess}
        </div>
      )}
    </div>
  )
}
