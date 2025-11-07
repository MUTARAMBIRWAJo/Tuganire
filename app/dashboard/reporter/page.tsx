import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { FileText, CheckCircle, Clock, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ReporterStatsPanel } from "@/components/reporter-stats-panel"

export default async function ReporterDashboard({
  searchParams,
}: { searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const supabase = await createClient()

  // Fetch reporter-specific statistics
  const [myArticlesCount, publishedCount, draftCount, submittedCount] = await Promise.all([
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
      .eq("status", "submitted"),
  ])

  const stats = {
    total: myArticlesCount.count || 0,
    published: publishedCount.count || 0,
    drafts: draftCount.count || 0,
    pending: submittedCount.count || 0,
  }

  // Fetch recent articles with filters and pagination
  const sp = await searchParams
  const q = (sp?.q || "").trim()
  const status = (sp?.status || "").trim()
  const page = Math.max(1, parseInt(sp?.page || "1", 10) || 1)
  const PAGE_SIZE = 5
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let list = supabase
    .from("articles")
    .select(`id, title, status, created_at, category:categories(name)`, { count: "exact" })
    .eq("author_id", user.id)

  if (q) list = list.ilike("title", `%${q}%`)
  if (status) list = list.eq("status", status)

  const { data: recentArticles, count: totalMyArticles } = await list
    .order("created_at", { ascending: false })
    .range(from, to)

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />

      <main className="flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">My Articles</h1>
            <p className="text-slate-600 mt-2">Manage your content and track performance</p>
          </div>
          <Link href="/dashboard/articles/new">
            <Button className="bg-orange-600 hover:bg-orange-700">
              <FileText className="mr-2 h-4 w-4" />
              Create New Article
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
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

        {/* Performance Card */}
        <Card className="mb-8 border-orange-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <CardTitle>Your Performance</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-slate-600">Approval Rate</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.total > 0 ? Math.round((stats.published / stats.total) * 100) : 0}%
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">This Month</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Status</p>
                <p className="text-lg font-semibold text-green-600">Active</p>
              </div>
            </div>
            <div className="mt-6">
              <ReporterStatsPanel />
            </div>
          </CardContent>
        </Card>

        {/* Recent Articles */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Articles</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <form className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3" action="/dashboard/reporter" method="get">
              <div>
                <label htmlFor="q" className="text-sm text-slate-700">Search</label>
                <input id="q" name="q" className="mt-1 w-full border rounded px-3 py-2" placeholder="Title..." defaultValue={q} />
              </div>
              <div>
                <label htmlFor="status" className="text-sm text-slate-700">Status</label>
                <input id="status" name="status" className="mt-1 w-full border rounded px-3 py-2" placeholder="draft | submitted | published" defaultValue={status} />
              </div>
              <div className="flex items-end">
                <Button type="submit" variant="default">Filter</Button>
              </div>
            </form>
            {recentArticles && recentArticles.length > 0 ? (
              <div className="space-y-4">
                {recentArticles.map((article) => {
                  const cat = Array.isArray(article.category) ? (article.category as any[])[0] : (article.category as any)
                  return (
                  <div key={article.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                    <div className="flex-1">
                      <h3 className="font-medium">{article.title}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                        <span>{cat?.name || "Uncategorized"}</span>
                        <span>•</span>
                        <span>{new Date(article.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          article.status === "published"
                            ? "bg-green-100 text-green-700"
                            : article.status === "pending"
                              ? "bg-blue-100 text-blue-700"
                              : article.status === "draft"
                                ? "bg-slate-100 text-slate-700"
                                : "bg-red-100 text-red-700"
                        }`}
                      >
                        {article.status}
                      </span>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>)
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">No articles yet. Start creating your first article!</p>
                <Link href="/dashboard/articles/new">
                  <Button className="bg-orange-600 hover:bg-orange-700">Create Article</Button>
                </Link>
              </div>
            )}
            {/* Pagination */}
            {totalMyArticles && totalMyArticles > PAGE_SIZE && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-slate-600">Showing {from + 1}-{Math.min(to + 1, totalMyArticles)} of {totalMyArticles}</div>
                <div className="flex gap-2">
                  <Link
                    href={{ pathname: "/dashboard/reporter", query: { q, status, page: String(Math.max(1, page - 1)) } }}
                    className={`px-3 py-1 rounded border ${page <= 1 ? "pointer-events-none opacity-50" : ""}`}
                  >
                    Prev
                  </Link>
                  <Link
                    href={{ pathname: "/dashboard/reporter", query: { q, status, page: String(page + 1) } }}
                    className={`px-3 py-1 rounded border ${to + 1 >= (totalMyArticles || 0) ? "pointer-events-none opacity-50" : ""}`}
                  >
                    Next
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
