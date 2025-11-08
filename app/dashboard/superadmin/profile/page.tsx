import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { ProfileManager } from "@/components/profile-manager"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock } from "lucide-react"

export default async function SuperAdminProfilePage() {
  const user = await getCurrentUser()
  if (!user || user.role !== "superadmin") {
    redirect("/auth/login")
  }

  const supabase = await createClient()

  let profileData: any = null
  let email: string | null = null

  try {
    const { data, error } = await supabase
      .from("app_users")
      .select("*")
      .eq("id", user.id)
      .single()

    if (error) {
      const { data: rpcData } = await supabase.rpc("get_my_app_user").single()
      profileData = rpcData
    } else {
      profileData = data
    }

    const { data: authUser } = await supabase.auth.getUser()
    email = authUser?.user?.email || null
  } catch {
    profileData = user
  }

  const profile = {
    id: user.id,
    display_name: profileData?.display_name || user.display_name || "",
    avatar_url: profileData?.avatar_url || user.avatar_url || "",
    role: user.role,
    created_at: profileData?.created_at || user.created_at || new Date().toISOString(),
    is_approved: profileData?.is_approved ?? false,
    bio: profileData?.bio || null,
    phone: profileData?.phone || null,
    location: profileData?.location || null,
    website: profileData?.website || null,
    twitter_url: profileData?.twitter_url || null,
    facebook_url: profileData?.facebook_url || null,
    linkedin_url: profileData?.linkedin_url || null,
    instagram_url: profileData?.instagram_url || null,
    youtube_url: profileData?.youtube_url || null,
    show_email: profileData?.show_email ?? false,
    show_phone: profileData?.show_phone ?? false,
    show_social_links: profileData?.show_social_links ?? true,
    email_public: profileData?.email_public ?? false,
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">My Profile</h1>
          <p className="text-slate-600 mt-2">Manage your profile information and privacy settings</p>
        </div>

        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-slate-600">Role:</span>
                  <Badge variant="secondary" className="capitalize">{user.role}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-600">Approval Status:</span>
                  {profile.is_approved ? (
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Approved
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </div>
                {email && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">Email:</span>
                    <span className="text-slate-800">{email}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-4xl">
          <ProfileManager userId={user.id} initialData={profile} />
        </div>
      </main>
    </div>
  )
}
