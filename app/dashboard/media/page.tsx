import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MediaUpload } from "@/components/media-upload"
import { ImageIcon, FileTextIcon, FilmIcon } from "lucide-react"

export default async function MediaLibraryPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const supabase = await createClient()

  // Fetch media files
  const { data: mediaFiles } = await supabase
    .from("media")
    .select(`
      *,
      uploader:profiles(full_name, email)
    `)
    .order("created_at", { ascending: false })

  // Calculate statistics
  const totalFiles = mediaFiles?.length || 0
  const totalSize = mediaFiles?.reduce((sum, file) => sum + file.file_size, 0) || 0
  const images = mediaFiles?.filter((f) => f.mime_type.startsWith("image/")).length || 0

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-bold">Media Library</h1>
        </div>
      </header>

      <main className="flex-1 bg-slate-50 p-6">
        <div className="container mx-auto">
          {/* Stats */}
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Files</CardTitle>
                <FileTextIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalFiles}</div>
                <p className="text-xs text-muted-foreground mt-1">All media files</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Images</CardTitle>
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{images}</div>
                <p className="text-xs text-muted-foreground mt-1">Image files</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                <FilmIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(totalSize / 1024 / 1024).toFixed(2)} MB</div>
                <p className="text-xs text-muted-foreground mt-1">Total storage</p>
              </CardContent>
            </Card>
          </div>

          {/* Upload Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Upload Media</CardTitle>
            </CardHeader>
            <CardContent>
              <MediaUpload userId={user.id} />
            </CardContent>
          </Card>

          {/* Media Grid */}
          <Card>
            <CardHeader>
              <CardTitle>All Media Files</CardTitle>
            </CardHeader>
            <CardContent>
              {mediaFiles && mediaFiles.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {mediaFiles.map((file) => (
                    <div
                      key={file.id}
                      className="group relative overflow-hidden rounded-lg border bg-white hover:shadow-md transition-shadow"
                    >
                      <div className="aspect-square bg-slate-100 flex items-center justify-center">
                        {file.mime_type.startsWith("image/") ? (
                          <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                            <ImageIcon className="h-12 w-12 text-slate-400" />
                          </div>
                        ) : (
                          <FileTextIcon className="h-12 w-12 text-slate-400" />
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium truncate" title={file.original_filename}>
                          {file.original_filename}
                        </p>
                        <p className="text-xs text-muted-foreground">{(file.file_size / 1024).toFixed(2)} KB</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(file.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No media files yet. Upload your first file to get started!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
