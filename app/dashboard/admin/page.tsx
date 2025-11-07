import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { BarChart3, FileText, Users, MessageSquare, CheckCircle, Clock } from "lucide-react"
import { AdminAnalyticsPanel } from "@/components/admin-analytics-panel"

export default async function AdminDashboard() {
  const user = await getCurrentUser()

  if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
    redirect("/auth/login")
  }

  const supabase = await createClient()

  // Fetch admin-specific statistics
  const [publishedCount, pendingCount, reportersCount, commentsCount] = await Promise.all([
    supabase.from("articles").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("articles").select("*", { count: "exact", head: true }).eq("status", "submitted"),
    supabase.from("app_users").select("*", { count: "exact", head: true }).eq("role", "reporter"),
    supabase.from("comments").select("*", { count: "exact", head: true }),
  ])

  const stats = {
    published: publishedCount.count || 0,
    pending: pendingCount.count || 0,
    reporters: reportersCount.count || 0,
    comments: commentsCount.count || 0,
  }

  // Fetch pending articles for review
  const { data: pendingArticles } = await supabase
    .from("articles")
    .select(`
      *,
      author:app_users(full_name:display_name),
      category:categories(name)
    `)
    .eq("status", "submitted")
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />

      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="text-slate-600 mt-2">Manage content, reporters, and platform moderation</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Published Articles</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.published}</div>
              <p className="text-xs text-slate-600 mt-1">Live on the site</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-slate-600 mt-1">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Reporters</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.reporters}</div>
              <p className="text-xs text-slate-600 mt-1">Content creators</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Comments</CardTitle>
              <MessageSquare className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.comments}</div>
              <p className="text-xs text-slate-600 mt-1">User engagement</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-blue-200 bg-blue-50">
            <CardHeader>
              <BarChart3 className="text-blue-600 mb-3 h-8 w-8" />
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">View site-wide analytics and performance stats</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-blue-200 bg-blue-50">
            <CardHeader>
              <FileText className="text-blue-600 mb-3 h-8 w-8" />
              <CardTitle>Manage Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">Approve or reject submitted news articles</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-blue-200 bg-blue-50">
            <CardHeader>
              <Users className="text-blue-600 mb-3 h-8 w-8" />
              <CardTitle>Reporters</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">Monitor and assign categories to reporters</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Articles */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Articles for Review</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingArticles && pendingArticles.length > 0 ? (
              <div className="space-y-4">
                {pendingArticles.map((article) => (
                  <div key={article.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                    <div className="flex-1">
                      <h3 className="font-medium">{article.title}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                        <span>{article.author?.full_name || "Anonymous"}</span>
                        <span>•</span>
                        <span>{article.category?.name || "Uncategorized"}</span>
                        <span>•</span>
                        <span>{new Date(article.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                        Approve
                      </button>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-600 py-8">No pending articles to review</p>
            )}
          </CardContent>
        </Card>

        {/* Live Analytics (SWR) */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Live Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminAnalyticsPanel />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
