import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import CommentsModerationTable from "@/components/comments-moderation-table"

export default async function SuperadminCommentsPage() {
  const me = await getCurrentUser()
  if (!me || me.role !== "superadmin") redirect("/auth/login")

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Comments Moderation</h1>
          <p className="text-slate-600 mt-2">Review, approve, reject or delete public comments.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Moderation Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <CommentsModerationTable />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
