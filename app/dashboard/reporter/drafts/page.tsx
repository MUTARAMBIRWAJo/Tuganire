import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { ReporterArticlesList } from "@/components/reporter-articles-list"

export default async function ReporterDraftsPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-800">My Drafts</h1>
          <Button asChild>
            <Link href="/dashboard/reporter/articles/new">
              <Plus className="mr-2 h-4 w-4" />
              New Article
            </Link>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Draft Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <ReporterArticlesList q="" status="draft" category="" from="" to="" page={1} pageSize={10} editLabel="Modify" />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
