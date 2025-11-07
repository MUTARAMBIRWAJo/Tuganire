import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"

export default async function SuperAdminAnalyticsPage() {
  const me = await getCurrentUser()
  if (!me || me.role !== "superadmin") redirect("/auth/login")

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabase = serviceKey && url
    ? createServiceClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
    : await createClient()
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const [
    { count: totalArticles },
    { count: published },
    { count: drafts },
    { count: submitted },
    { count: reporters },
    { count: comments },
    { count: last7 },
    { data: allCategories },
  ] = await Promise.all([
    supabase.from("articles").select("*", { count: "exact", head: true }),
    supabase.from("articles").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("articles").select("*", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("articles").select("*", { count: "exact", head: true }).eq("status", "submitted"),
    supabase.from("app_users").select("*", { count: "exact", head: true }).eq("role", "reporter"),
    supabase.from("comments").select("*", { count: "exact", head: true }),
    supabase.from("articles").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
    supabase.from("categories").select("id, name"),
  ])

  // Simple top categories: make small per-category counts and pick top 5
  let topCategories: { name: string; count: number }[] = []
  if (allCategories && allCategories.length > 0) {
    const results = await Promise.all(
      allCategories.slice(0, 20).map(async (c: any) => {
        const { count } = await supabase
          .from("articles")
          .select("*", { count: "exact", head: true })
          .eq("category_id", c.id)
          .eq("status", "published")
        return { name: c.name, count: count || 0 }
      })
    )
    topCategories = results.sort((a, b) => b.count - a.count).slice(0, 5)
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">System Analytics</h1>
          <p className="text-slate-600 mt-2">Key metrics and breakdowns</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalArticles || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Published</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{published || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Submitted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{submitted || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Drafts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{drafts || 0}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Reporters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{reporters || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{comments || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>New Articles (7d)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{last7 || 0}</div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Top Categories</CardTitle>
            </CardHeader>
            <CardContent>
              {topCategories.length > 0 ? (
                <ul className="text-sm text-slate-700 space-y-1">
                  {topCategories.map((c) => (
                    <li key={c.name} className="flex items-center justify-between">
                      <span>{c.name}</span>
                      <span className="font-semibold">{c.count}</span>
                    </li>) )}
                </ul>
              ) : (
                <p className="text-slate-600">No category data.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
