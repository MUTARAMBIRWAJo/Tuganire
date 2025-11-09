"use client"

import { useEffect, useState } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Image as ImageIcon, Video, Eye, MousePointerClick } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface Advertisement {
  id: string
  title: string
  description: string | null
  media_type: "image" | "video"
  media_url: string
  link_url: string | null
  is_active: boolean
  display_order: number
  start_date: string | null
  end_date: string | null
  click_count: number
  view_count: number
  created_at: string
}

export default function AdvertisementsPage() {
  const [ads, setAds] = useState<Advertisement[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    media_type: "image" as "image" | "video",
    media_url: "",
    link_url: "",
    is_active: true,
    display_order: 0,
    start_date: "",
    end_date: "",
  })

  useEffect(() => {
    fetchAds()
  }, [])

  const fetchAds = async () => {
    try {
      const response = await fetch("/api/admin/advertisements")
      if (!response.ok) throw new Error("Failed to fetch ads")
      const data = await response.json()
      setAds(data.ads || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load advertisements",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingAd
        ? `/api/admin/advertisements/${editingAd.id}`
        : "/api/admin/advertisements"
      const method = editingAd ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save advertisement")
      }

      toast({
        title: "Success",
        description: editingAd ? "Advertisement updated" : "Advertisement created",
      })

      setIsDialogOpen(false)
      setEditingAd(null)
      resetForm()
      fetchAds()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save advertisement",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this advertisement?")) return

    try {
      const response = await fetch(`/api/admin/advertisements/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete advertisement")

      toast({
        title: "Success",
        description: "Advertisement deleted",
      })

      fetchAds()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete advertisement",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (ad: Advertisement) => {
    setEditingAd(ad)
    setFormData({
      title: ad.title,
      description: ad.description || "",
      media_type: ad.media_type,
      media_url: ad.media_url,
      link_url: ad.link_url || "",
      is_active: ad.is_active,
      display_order: ad.display_order,
      start_date: ad.start_date ? ad.start_date.split("T")[0] : "",
      end_date: ad.end_date ? ad.end_date.split("T")[0] : "",
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      media_type: "image",
      media_url: "",
      link_url: "",
      is_active: true,
      display_order: 0,
      start_date: "",
      end_date: "",
    })
    setEditingAd(null)
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Advertisements</h1>
            <p className="text-slate-600 mt-2">Manage website advertisements</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) {
              resetForm()
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Advertisement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingAd ? "Edit Advertisement" : "Create Advertisement"}
                </DialogTitle>
                <DialogDescription>
                  Add images or videos to display in the advertisement marquee
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="media_type">Media Type *</Label>
                  <select
                    id="media_type"
                    value={formData.media_type}
                    onChange={(e) => setFormData({ ...formData, media_type: e.target.value as "image" | "video" })}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="media_url">Media URL *</Label>
                  <Input
                    id="media_url"
                    type="url"
                    value={formData.media_url}
                    onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
                    placeholder="https://example.com/image.jpg or https://example.com/video.mp4"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the full URL to the image or video file
                  </p>
                </div>

                <div>
                  <Label htmlFor="link_url">Link URL (Optional)</Label>
                  <Input
                    id="link_url"
                    type="url"
                    value={formData.link_url}
                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                    placeholder="https://example.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL to redirect when ad is clicked
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="display_order">Display Order</Label>
                    <Input
                      id="display_order"
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Start Date (Optional)</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="end_date">End Date (Optional)</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false)
                      resetForm()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingAd ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : ads.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No advertisements yet. Create your first one!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {ads.map((ad) => (
              <Card key={ad.id}>
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    <div className="flex-shrink-0">
                      {ad.media_type === "image" ? (
                        <div className="relative w-32 h-48 rounded-lg overflow-hidden bg-slate-200">
                          <Image
                            src={ad.media_url}
                            alt={ad.title}
                            fill
                            className="object-cover"
                            sizes="128px"
                          />
                        </div>
                      ) : (
                        <div className="relative w-32 h-48 rounded-lg overflow-hidden bg-slate-200 flex items-center justify-center">
                          <Video className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{ad.title}</h3>
                          {ad.description && (
                            <p className="text-sm text-gray-600 mt-1">{ad.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              ad.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {ad.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                        <div>
                          <span className="text-gray-500">Type:</span>
                          <div className="flex items-center gap-1 mt-1">
                            {ad.media_type === "image" ? (
                              <ImageIcon className="h-4 w-4" />
                            ) : (
                              <Video className="h-4 w-4" />
                            )}
                            <span className="capitalize">{ad.media_type}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Views:</span>
                          <div className="flex items-center gap-1 mt-1">
                            <Eye className="h-4 w-4" />
                            <span>{ad.view_count}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Clicks:</span>
                          <div className="flex items-center gap-1 mt-1">
                            <MousePointerClick className="h-4 w-4" />
                            <span>{ad.click_count}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Order:</span>
                          <span className="ml-2">{ad.display_order}</span>
                        </div>
                      </div>

                      {ad.link_url && (
                        <div className="mt-2">
                          <span className="text-gray-500 text-sm">Link: </span>
                          <a
                            href={ad.link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            {ad.link_url}
                          </a>
                        </div>
                      )}

                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(ad)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(ad.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

