import { redirect } from "next/navigation"
import { getCurrentUser, hasRole } from "@/lib/auth"
import { ArticleForm } from "@/components/article-form"

export default async function NewArticlePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user has permission to create articles
  const canCreate = await hasRole(user.id, ["SuperAdmin", "Admin", "Reporter"]) 
  const isReporter = (user.role || "").toLowerCase() === "reporter"

  if (!canCreate && !isReporter) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center px-4">
          <h1 className="text-2xl font-bold">Create New Article</h1>
        </div>
      </header>

      <main className="flex-1 bg-slate-50 p-6">
        <div className="container mx-auto max-w-4xl">
          <ArticleForm 
            userId={user.id} 
            forceDraft={isReporter}
            afterSaveHref={isReporter ? "/dashboard/reporter/articles" : "/dashboard/articles"}
          />
        </div>
      </main>
    </div>
  )
}
