import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { BarChart3, CheckCircle, Clock, FileText } from "lucide-react"
import ViewsMiniChart from "@/components/views-mini-chart"
import ReporterArticleMetricsCharts from "@/components/ReporterArticleMetricsCharts"

export default async function ReporterStatsPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  const supabase = await createClient()

  const [totalRes, publishedRes, draftRes, pendingRes] = await Promise.all([
    supabase.from("articles").select("*", { count: "exact", head: true }).eq("author_id", user.id),
    supabase
      .from("articles")
      .select("*", { count: "exact", head: true })
      .eq("author_id", user.id)
      .eq("status", "published"),
    supabase
      .from("articles")
      .select("*", { count: "exact", head: true })
      .eq("author_id", user.id)
      .eq("status", "draft"),
    supabase
      .from("articles")
      .select("*", { count: "exact", head: true })
      .eq("author_id", user.id)
      .eq("status", "pending"),
  ])

  const stats = {
    total: totalRes.count || 0,
    published: publishedRes.count || 0,
    drafts: draftRes.count || 0,
    pending: pendingRes.count || 0,
  }

  // Per-article metrics for this reporter
  const { data: articlesForMetrics } = await supabase
    .from("articles")
    .select("id, slug, title, views_count, likes_count")
    .eq("author_id", user.id)
    .eq("status", "published")
    .limit(50)

  const metricsItems: { slug: string; title: string; views: number; likes: number; comments: number }[] = []

  if (articlesForMetrics && articlesForMetrics.length > 0) {
    for (const a of articlesForMetrics as any[]) {
      let comments = 0
      try {
        const { count } = await supabase
          .from("comments")
          .select("id", { count: "exact", head: true })
          .eq("article_slug", a.slug)
          .eq("status", "approved")
        comments = count || 0
      } catch {
        comments = 0
      }
      metricsItems.push({
        slug: a.slug,
        title: a.title,
        views: Number(a.views_count) || 0,
        likes: Number(a.likes_count) || 0,
        comments,
      })
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">My Statistics</h1>
          <p className="text-slate-600 mt-2">Overview of your article performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              <FileText className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-slate-600 mt-1">All your content</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.published}</div>
              <p className="text-xs text-slate-600 mt-1">Live articles</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Under Review</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-slate-600 mt-1">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Drafts</CardTitle>
              <FileText className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.drafts}</div>
              <p className="text-xs text-slate-600 mt-1">Work in progress</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-orange-600" />
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-slate-700 space-y-2">
              <li>Approval rate: {stats.total ? Math.round((stats.published / stats.total) * 100) : 0}%</li>
              <li>Pending share: {stats.total ? Math.round((stats.pending / stats.total) * 100) : 0}%</li>
              <li>Draft share: {stats.total ? Math.round((stats.drafts / stats.total) * 100) : 0}%</li>
            </ul>
          </CardContent>
        </Card>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Views (last 30 days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ViewsMiniChart defaultRange="30d" scope="reporter" />
            </CardContent>
          </Card>
        </div>

        <ReporterArticleMetricsCharts items={metricsItems} />
      </main>
    </div>
  )
}
