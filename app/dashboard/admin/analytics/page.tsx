import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ViewsMiniChart from "@/components/views-mini-chart"

export default async function AdminAnalyticsPage() {
  const me = await getCurrentUser()
  if (!me || me.role?.toLowerCase() !== "admin") redirect("/auth/login")

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Analytics</h1>
          <p className="text-slate-600 mt-2">Key traffic insights</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Views</CardTitle>
          </CardHeader>
          <CardContent>
            <ViewsMiniChart defaultRange="30d" />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
