import { createClient } from "@/lib/supabase/server"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export const dynamic = "force-dynamic"

function toEmbedUrl(url: string): string {
  if (!url) return ""
  try {
    // Handle youtu.be short links
    const short = url.match(/^https?:\/\/youtu\.be\/([\w-]{6,})/i)
    if (short) return `https://www.youtube.com/embed/${short[1]}`
    // Handle standard watch URLs
    const u = new URL(url)
    const v = u.searchParams.get("v")
    if (v) return `https://www.youtube.com/embed/${v}`
    // Fallback: replace watch?v=
    return url.replace("watch?v=", "embed/")
  } catch {
    return url.replace("watch?v=", "embed/")
  }
}

function youtubeId(url: string): string | null {
  try {
    const short = url.match(/^https?:\/\/youtu\.be\/([\w-]{6,})/i)
    if (short) return short[1]
    const u = new URL(url)
    const v = u.searchParams.get("v")
    if (v) return v
    const m = url.match(/\/embed\/([\w-]{6,})/)
    return m ? m[1] : null
  } catch {
    const m = url.match(/(?:v=|\/embed\/)([\w-]{6,})/)
    return m ? m[1] : null
  }
}

export default async function VideosPage() {
  const supabase = await createClient()
  const { data: videos } = await supabase
    .from("articles")
    .select("id, title, slug, excerpt, published_at, youtube_link, article_type")
    .eq("article_type", "video")
    .order("created_at", { ascending: false })
    .limit(30)

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-slate-950">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Videos</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-2">Latest video stories</p>
        </div>

        {!videos || videos.length === 0 ? (
          <p className="text-slate-600">No video articles yet.</p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((v) => {
              const id = v.youtube_link ? youtubeId(v.youtube_link as any) : null
              const thumb = id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null
              return (
                <article key={v.id} className="rounded-lg border bg-white dark:bg-slate-900 overflow-hidden">
                  <a href={`/articles/${v.slug}`} className="block">
                    <div className="aspect-video bg-black">
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={thumb} alt={v.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">No preview</div>
                      )}
                    </div>
                  </a>
                  <div className="p-4">
                    <h2 className="font-semibold text-slate-900 dark:text-white line-clamp-2">{v.title}</h2>
                    {v.excerpt && (
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-3">{v.excerpt}</p>
                    )}
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <p className="text-xs text-slate-500">
                        {v.published_at ? new Date(v.published_at as any).toLocaleDateString() : "Unpublished"}
                      </p>
                      <div className="flex items-center gap-2">
                        <a href={`/articles/${v.slug}`} className="text-sm px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">Watch</a>
                        {v.youtube_link && (
                          <a
                            href={v.youtube_link as any}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm px-3 py-1 rounded border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            YouTube
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
