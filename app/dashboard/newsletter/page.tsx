import { redirect } from "next/navigation"
import { getCurrentUser, isAdmin } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mail, Users, Send } from "lucide-react"

export default async function NewsletterDashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const hasAdminAccess = await isAdmin(user.id)

  if (!hasAdminAccess) {
    redirect("/dashboard")
  }

  const supabase = await createClient()

  // Fetch newsletter statistics
  const [subscribersCount, activeCount, campaignsCount] = await Promise.all([
    supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }),
    supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("newsletter_campaigns").select("*", { count: "exact", head: true }),
  ])

  // Fetch recent subscribers
  const { data: recentSubscribers } = await supabase
    .from("newsletter_subscribers")
    .select("*")
    .order("subscribed_at", { ascending: false })
    .limit(10)

  // Fetch recent campaigns
  const { data: recentCampaigns } = await supabase
    .from("newsletter_campaigns")
    .select(`
      *,
      creator:profiles(full_name, email)
    `)
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold">Newsletter Management</h1>
          </div>
          <Button asChild>
            <Link href="/dashboard/newsletter/campaigns/new">
              <Send className="mr-2 h-4 w-4" />
              New Campaign
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 bg-slate-50 p-6">
        <div className="container mx-auto">
          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{subscribersCount.count || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">All time subscribers</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeCount.count || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Currently subscribed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Campaigns Sent</CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{campaignsCount.count || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Total campaigns</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Subscribers */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Subscribers</CardTitle>
              </CardHeader>
              <CardContent>
                {recentSubscribers && recentSubscribers.length > 0 ? (
                  <div className="space-y-4">
                    {recentSubscribers.map((subscriber) => (
                      <div
                        key={subscriber.id}
                        className="flex items-center justify-between border-b pb-3 last:border-0"
                      >
                        <div>
                          <p className="font-medium">{subscriber.full_name || "Anonymous"}</p>
                          <p className="text-sm text-muted-foreground">{subscriber.email}</p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                              subscriber.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {subscriber.is_active ? "Active" : "Inactive"}
                          </span>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(subscriber.subscribed_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No subscribers yet</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Campaigns */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                {recentCampaigns && recentCampaigns.length > 0 ? (
                  <div className="space-y-4">
                    {recentCampaigns.map((campaign) => (
                      <div key={campaign.id} className="border-b pb-3 last:border-0">
                        <h4 className="font-medium mb-1">{campaign.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{campaign.subject}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>By {campaign.creator?.full_name || campaign.creator?.email}</span>
                          <span>{campaign.sent_at ? `Sent to ${campaign.sent_count} subscribers` : "Draft"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No campaigns yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
