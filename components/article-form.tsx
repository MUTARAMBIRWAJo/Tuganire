"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Save, Send, Star } from "lucide-react"
import { RichTextEditor } from "./rich-text-editor"
import { MediaUploader } from "./media-uploader"
import type { MediaItem } from "@/lib/types"

interface ArticleFormProps {
  userId: string
  // When true, all submissions are saved as draft and publish/review actions are hidden
  forceDraft?: boolean
  // Optional path to navigate to after saving
  afterSaveHref?: string
  article?: {
    id: string
    title: string
    slug: string
    excerpt: string | null
    content: string
    status: string
    category_id: string | null
    featured_image: string | null
    media: MediaItem[]
  }
}

export function ArticleForm({ userId, article, forceDraft, afterSaveHref }: ArticleFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([])
  const [tags, setTags] = useState<Array<{ id: number; name: string }>>([])
  const [selectedTags, setSelectedTags] = useState<number[]>([])

  const [formData, setFormData] = useState({
    title: article?.title || "",
    slug: article?.slug || "",
    excerpt: article?.excerpt || "",
    content: article?.content || "",
    status: article?.status || "draft",
    category_id: article?.category_id || "",
    featured_image: article?.featured_image || "",
    media: article?.media || ([] as MediaItem[]),
  })

  const supabases = supabase

  // Fetch categories and tags
  useEffect(() => {
    const fetchData = async () => {
      const [categoriesRes, tagsRes] = await Promise.all([
        supabases.from("categories").select("id, name").order("name"),
        supabases.from("tags").select("id, name").order("name"),
      ])

      if (categoriesRes.data) setCategories(categoriesRes.data)
      if (tagsRes.data) setTags(tagsRes.data)
    }

    fetchData()
  }, [])

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (!article && formData.title) {
      const interval = setInterval(() => {
        handleSaveDraft()
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [formData])

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    })
  }

  const handleSaveDraft = async () => {
    if (!formData.title || !formData.content) return

    const supabases = supabase

    try {
      // Ensure user is authenticated; otherwise RLS will block insert/update
      const { data: auth } = await supabases.auth.getUser()
      if (!auth?.user?.id) {
        console.warn("Auto-save skipped: not authenticated")
        return
      }

      const articleData: any = {
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        excerpt: formData.excerpt || null,
        content: formData.content,
        author_id: userId,
        status: "draft",
        category_id: formData.category_id ? Number(formData.category_id) : null,
        featured_image: formData.featured_image || null,
        updated_at: new Date().toISOString(),
      }

      if (article) {
        const { error } = await supabases
          .from("articles")
          .update(articleData)
          .eq("id", article.id)
          .select("id")
          .single()

        if (error) {
          console.error("Auto-save failed (update):", { message: error.message, details: (error as any).details, hint: (error as any).hint })
        }
      } else {
        const { error } = await supabases
          .from("articles")
          .insert(articleData)
          .select("id")
          .single()

        if (error) {
          console.error("Auto-save failed (insert):", { message: error.message, details: (error as any).details, hint: (error as any).hint })
        }
      }
    } catch (err) {
      console.error("Auto-save failed (exception):", err)
    }
  }

  const handleSubmit = async (e: React.FormEvent, submitStatus: "draft" | "pending" | "published") => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validation
    if (!formData.title || !formData.content) {
      setError("Title and content are required")
      setIsLoading(false)
      return
    }

    // Category is required for non-draft submissions
    if (submitStatus !== "draft" && !formData.category_id) {
      setError("Please select a category")
      setIsLoading(false)
      return
    }

    // Featured image is required for non-draft submissions
    if (submitStatus !== "draft" && !formData.featured_image) {
      setError("Please upload and select a featured image")
      setIsLoading(false)
      return
    }

    try {
      const effectiveStatus: "draft" | "submitted" | "published" = forceDraft 
        ? "draft" 
        : submitStatus === "pending" 
          ? "submitted" 
          : submitStatus

      // Prepare article data - don't include media as JSON if it's not in schema
      const articleData: any = {
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        excerpt: formData.excerpt || null,
        content: formData.content,
        author_id: userId,
        status: effectiveStatus,
        category_id: formData.category_id ? Number(formData.category_id) : null,
        featured_image: formData.featured_image || null,
        updated_at: new Date().toISOString(),
      }

      // Only set published_at if publishing
      if (effectiveStatus === "published") {
        articleData.published_at = new Date().toISOString()
      }

      let articleId: string

      if (article) {
        const { data, error } = await supabases
          .from("articles")
          .update(articleData)
          .eq("id", article.id)
          .select()
          .single()

        if (error) {
          console.error("Update error:", error)
          throw new Error(error.message || "Failed to update article")
        }

        articleId = article.id
      } else {
        const { data, error } = await supabases
          .from("articles")
          .insert(articleData)
          .select()
          .single()

        if (error) {
          console.error("Insert error:", error)
          throw new Error(error.message || "Failed to create article")
        }

        articleId = data.id
      }

      // Add tags if selected
      if (selectedTags.length > 0 && articleId) {
        // Delete existing tags first
        await supabases.from("article_tags").delete().eq("article_id", articleId)
        
        // Insert new tags
        if (selectedTags.length > 0) {
          const { error: tagError } = await supabases
            .from("article_tags")
            .insert(selectedTags.map((tagId) => ({ article_id: articleId, tag_id: tagId })))
          
          if (tagError) {
            console.error("Tag error:", tagError)
            // Don't throw - tags are optional
          }
        }
      }

      router.push(afterSaveHref || "/dashboard/articles")
      router.refresh()
    } catch (err: unknown) {
      console.error("Submit error:", err)
      const errorMessage = err instanceof Error 
        ? err.message 
        : typeof err === 'object' && err !== null && 'message' in err
          ? String(err.message)
          : "An error occurred"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Form Fields */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{article ? "Edit Article" : "Create New Article"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter article title"
                required
                className="text-lg font-semibold"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="article-slug"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category_id?.toString()}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Select
                  value={selectedTags[0]?.toString()}
                  onValueChange={(value) => setSelectedTags([...selectedTags, Number.parseInt(value)])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Add tags" />
                  </SelectTrigger>
                  <SelectContent>
                    {tags.map((tag) => (
                      <SelectItem key={tag.id} value={tag.id.toString()}>
                        {tag.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief summary of the article (optional)"
                rows={3}
              />
            </div>

            <RichTextEditor
              label="Content *"
              value={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
              placeholder="Write your article content here..."
            />

            {error && (
              <div className="rounded-md bg-red-50 p-3 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-4">
              <Button type="button" variant="outline" onClick={(e) => handleSubmit(e, "draft")} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Draft
              </Button>
              {!forceDraft && (
                <>
                  <Button
                    type="button"
                    onClick={(e) => handleSubmit(e, "pending")}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Submit for Review
                  </Button>
                  <Button
                    type="button"
                    onClick={(e) => handleSubmit(e, "published")}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Publish Now
                  </Button>
                </>
              )}
              <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isLoading}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Media Upload */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Media</CardTitle>
          </CardHeader>
          <CardContent>
            <MediaUploader
              media={formData.media}
              onChange={(media) => setFormData({ ...formData, media })}
              featuredImage={formData.featured_image}
              onFeaturedChange={(url) => setFormData({ ...formData, featured_image: url })}
            />
            
            {/* Featured Image Preview */}
            {formData.featured_image && (
              <div className="mt-4 p-3 border rounded-lg bg-slate-50">
                <Label className="text-sm font-medium text-slate-700 mb-2 block">Featured Image Preview</Label>
                <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-orange-300">
                  <img
                    src={formData.featured_image}
                    alt="Featured"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg"
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-orange-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    Featured
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Publishing Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Status:</span>
              <span className="font-medium capitalize">{formData.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Auto-save:</span>
              <span className="text-green-600">Enabled</span>
            </div>
            {article && (
              <div className="flex justify-between">
                <span className="text-slate-600">Last updated:</span>
                <span className="font-medium">Just now</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
