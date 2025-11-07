import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

export default async function ReporterProfilePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">My Profile</h1>
          <p className="text-slate-600 mt-2">View your account information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Display name</span>
                <span className="font-medium">{user.display_name || "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Role</span>
                <span className="font-medium capitalize">{user.role || "—"}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Approval</span>
                <span className="font-medium">{(user as any).is_approved ? "Yes" : "Pending"}</span>
              </div>
            </CardContent>
          </Card>

          {/* Intentionally left out additional meta fields to avoid relying on non-existent AppUser columns */}
        </div>
      </main>
    </div>
  )
}
