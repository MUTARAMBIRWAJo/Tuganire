import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"
import { FileText, TrendingUp, Users, Clock, AlertCircle } from "lucide-react"

export default async function SuperAdminReportsPage() {
  const me = await getCurrentUser()
  if (!me || me.role !== "superadmin") redirect("/auth/login")

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabase = serviceKey && url
    ? createServiceClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
    : await createClient()

  // Get date ranges
  const now = new Date()
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Fetch comprehensive statistics
  const [
    { count: totalArticles },
    { count: publishedArticles },
    { count: draftArticles },
    { count: submittedArticles },
    { count: totalUsers },
    { count: activeUsers },
    { count: admins },
    { count: reporters },
    { data: recentArticles },
    { data: topAuthors },
  ] = await Promise.all([
    supabase.from("articles").select("*", { count: "exact", head: true }),
    supabase.from("articles").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("articles").select("*", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("articles").select("*", { count: "exact", head: true }).eq("status", "submitted"),
    supabase.from("app_users").select("*", { count: "exact", head: true }),
    supabase.from("app_users").select("*", { count: "exact", head: true }).eq("is_approved", true),
    supabase.from("app_users").select("*", { count: "exact", head: true }).eq("role", "admin"),
    supabase.from("app_users").select("*", { count: "exact", head: true }).eq("role", "reporter"),
    supabase
      .from("articles")
      .select("id, title, created_at, views_count, author:app_users(display_name)")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("articles")
      .select("author_id, author:app_users(display_name)")
      .eq("status", "published"),
  ])

  // Calculate top authors
  const authorCounts: Record<string, { name: string; count: number }> = {}
  if (topAuthors) {
    topAuthors.forEach((article: any) => {
      const author = Array.isArray(article.author) ? article.author[0] : article.author
      const authorName = (author as any)?.display_name || "Unknown"
      const authorId = article.author_id
      if (authorId) {
        if (!authorCounts[authorId]) {
          authorCounts[authorId] = { name: authorName, count: 0 }
        }
        authorCounts[authorId].count++
      }
    })
  }
  const topAuthorsList = Object.values(authorCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">System Reports</h1>
          <p className="text-slate-600 mt-2">Comprehensive system statistics and insights</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalArticles || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {publishedArticles || 0} published, {draftArticles || 0} drafts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {activeUsers || 0} approved, {admins || 0} admins
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{submittedArticles || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Articles awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Content Creators</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reporters || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Active reporters</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentArticles && recentArticles.length > 0 ? (
                  recentArticles.map((article: any) => {
                    const author = Array.isArray(article.author) ? article.author[0] : article.author
                    const authorName = (author as any)?.display_name || "Unknown"
                    return (
                      <div key={article.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex-1">
                          <p className="text-sm font-medium line-clamp-1">{article.title}</p>
                          <p className="text-xs text-slate-500">
                            {authorName} • {new Date(article.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-xs text-slate-600 ml-4">
                          {article.views_count || 0} views
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-sm text-slate-600">No recent articles</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Authors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topAuthorsList.length > 0 ? (
                  topAuthorsList.map((author, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-400 w-6">{index + 1}</span>
                        <span className="text-sm font-medium">{author.name}</span>
                      </div>
                      <span className="text-sm text-slate-600">{author.count} articles</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-600">No author data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

