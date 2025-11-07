import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { ArticleForm } from "@/components/article-form"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import Link from "next/link"
import type { MediaItem } from "@/lib/types"

interface EditArticlePageProps {
  params: Promise<{ id: string }>
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { id } = await params

  // Use service role key if available for superadmin, otherwise regular client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabase = (user.role === "superadmin" && serviceKey && url)
    ? createServiceClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
    : await createClient()

  // Fetch article with relations
  const { data: article, error } = await supabase
    .from("articles")
    .select(`
      id,
      title,
      slug,
      excerpt,
      content,
      status,
      category_id,
      featured_image,
      author_id
    `)
    .eq("id", id)
    .single()

  if (error || !article) {
    redirect("/dashboard/articles")
  }

  // Check permissions - reporters can only edit their own articles
  if (user.role === "reporter" && article.author_id !== user.id) {
    redirect("/dashboard/reporter/articles")
  }

  // Fetch tags for this article (optional, article form handles tags separately)
  const { data: articleTags } = await supabase
    .from("article_tags")
    .select("tag_id")
    .eq("article_id", id)

  // Parse media if it exists (though it's not in the schema, we'll handle it)
  let media: MediaItem[] = []
  if (article.featured_image) {
    media = [{
      url: article.featured_image,
      type: "image" as const,
      alt: "Featured image",
      isFeatured: true,
    }]
  }

  const isReporter = (user.role || "").toLowerCase() === "reporter"
  const isSuperAdmin = (user.role || "").toLowerCase() === "superadmin"

  // Determine back link based on user role
  const backLink = isSuperAdmin 
    ? "/dashboard/superadmin/articles" 
    : isReporter 
      ? "/dashboard/reporter/articles" 
      : "/dashboard/articles"

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <div className="mb-6 flex items-center gap-4">
          <Link 
            href={backLink}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            ← Back to Articles
          </Link>
          <h1 className="text-3xl font-bold text-slate-800">Edit Article</h1>
        </div>
        <div className="max-w-4xl">
          <ArticleForm
            userId={user.id}
            article={{
              id: article.id,
              title: article.title,
              slug: article.slug,
              excerpt: article.excerpt,
              content: article.content,
              status: article.status,
              category_id: article.category_id?.toString() || null,
              featured_image: article.featured_image,
              media: media,
            }}
            forceDraft={isReporter}
            afterSaveHref={backLink}
          />
        </div>
      </main>
    </div>
  )
}

