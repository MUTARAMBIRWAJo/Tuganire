import { redirect } from "next/navigation"
import { getCurrentUser, isAdmin } from "@/lib/auth"
import { CampaignForm } from "@/components/campaign-form"

export default async function NewCampaignPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const hasAdminAccess = await isAdmin(user.id)

  if (!hasAdminAccess) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center px-4">
          <h1 className="text-2xl font-bold">Create Newsletter Campaign</h1>
        </div>
      </header>

      <main className="flex-1 bg-slate-50 p-6">
        <div className="container mx-auto max-w-4xl">
          <CampaignForm userId={user.id} />
        </div>
      </main>
    </div>
  )
}
