import { redirect } from "next/navigation"
import { getCurrentUser, hasRole } from "@/lib/auth"
import { ArticleForm } from "@/components/article-form"
import Link from "next/link"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

export default async function NewReporterArticlePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const canCreate = await hasRole(user.id, ["Reporter", "Admin", "SuperAdmin"])

  if (!canCreate) {
    redirect("/dashboard/reporter")
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/dashboard/reporter/articles" className="text-sm text-slate-600 hover:text-slate-900">
            ← Back to My Articles
          </Link>
          <h1 className="text-3xl font-bold text-slate-800">Create New Article</h1>
        </div>
        <div className="max-w-4xl">
          <ArticleForm userId={user.id} forceDraft afterSaveHref="/dashboard/reporter/articles" />
        </div>
      </main>
    </div>
  )
}
