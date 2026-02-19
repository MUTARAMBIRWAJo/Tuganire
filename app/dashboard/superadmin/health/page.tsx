export const revalidate = 60;

import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export default async function SuperAdminHealthPage() {
  const me = await getCurrentUser()
  if (!me || me.role !== "superadmin") redirect("/auth/login")

  const supabase = await createClient()
  const [
    { count: totalArticles },
    { count: submitted },
    { count: reporters },
    { count: comments },
  ] = await Promise.all([
    supabase.from("articles").select("*", { count: "exact", head: true }),
    supabase.from("articles").select("*", { count: "exact", head: true }).eq("status", "submitted"),
    supabase.from("app_users").select("*", { count: "exact", head: true }).eq("role", "reporter"),
    supabase.from("comments").select("*", { count: "exact", head: true }),
  ])

  const pendingRatio = totalArticles ? Math.round(((submitted || 0) / totalArticles) * 100) : 0
  const checks = [
    { name: "Articles table reachable", ok: typeof totalArticles === "number" },
    { name: "Moderation backlog < 30%", ok: pendingRatio < 30, meta: `${pendingRatio}%` },
    { name: "At least 1 reporter", ok: (reporters || 0) > 0, meta: String(reporters || 0) },
    { name: "Comments table reachable", ok: typeof comments === "number" },
  ]

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">System Health</h1>
          <p className="text-slate-600 mt-2">Monitor key counters and moderation backlog</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader><CardTitle>Total Articles</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">{totalArticles || 0}</div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Submitted</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">{submitted || 0}</div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Reporters</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">{reporters || 0}</div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Comments</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">{comments || 0}</div></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Health Checks</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {checks.map((c) => (
                <li key={c.name} className="flex items-center justify-between rounded border p-3 bg-white">
                  <span className="text-sm text-slate-800">{c.name}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${c.ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {c.ok ? "OK" : "Attention"}{c.meta ? ` • ${c.meta}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
