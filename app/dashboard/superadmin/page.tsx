import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Users, FileText, ShieldCheck, BarChart3, Settings } from "lucide-react"
import Link from "next/link"
import { createClient as createServiceClient } from "@supabase/supabase-js"

export default async function SuperAdminDashboard() {
  const user = await getCurrentUser()

  if (!user || user.role !== "superadmin") {
    redirect("/auth/login")
  }

  // Prefer service-role client if available; otherwise fall back to standard server client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabase = serviceKey && url
    ? createServiceClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
    : await createClient()

  const [articlesCount, usersCount, adminsCount, reportersCount] = await Promise.all([
    supabase.from("articles").select("*", { count: "exact", head: true }),
    supabase.from("app_users").select("*", { count: "exact", head: true }),
    supabase.from("app_users").select("*", { count: "exact", head: true }).eq("role", "admin"),
    supabase.from("app_users").select("*", { count: "exact", head: true }).eq("role", "reporter"),
  ])

  const stats = {
    totalUsers: usersCount.count || 0,
    admins: adminsCount.count || 0,
    reporters: reportersCount.count || 0,
    articles: articlesCount.count || 0,
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />

      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">SuperAdmin Dashboard</h1>
          <p className="text-slate-600 mt-2">Complete system overview and management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs opacity-80 mt-1">All registered accounts</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <ShieldCheck className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.admins}</div>
              <p className="text-xs opacity-80 mt-1">Active administrators</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Reporters</CardTitle>
              <Users className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.reporters}</div>
              <p className="text-xs opacity-80 mt-1">Content creators</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              <FileText className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.articles}</div>
              <p className="text-xs opacity-80 mt-1">Published & drafts</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/dashboard/superadmin/analytics" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <BarChart3 className="text-blue-600 mb-3 h-8 w-8" />
                <CardTitle>System Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">View comprehensive platform statistics and performance metrics</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/superadmin/users" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <Users className="text-blue-600 mb-3 h-8 w-8" />
                <CardTitle>Manage Users</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  Control user accounts, roles, and permissions across the platform
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/superadmin/articles" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <FileText className="text-blue-600 mb-3 h-8 w-8" />
                <CardTitle>Manage Articles</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  View, edit, and manage all articles in the system
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/superadmin/approvals" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <ShieldCheck className="text-blue-600 mb-3 h-8 w-8" />
                <CardTitle>Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">Review and approve pending reporter/admin accounts</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/superadmin/settings" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <Settings className="text-blue-600 mb-3 h-8 w-8" />
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">Configure global settings, SEO, email, and site information</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  )
}
