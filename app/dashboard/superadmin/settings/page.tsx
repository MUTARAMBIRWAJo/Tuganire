import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { revalidatePath } from "next/cache"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

export default async function SuperAdminSettingsPage() {
  const me = await getCurrentUser()
  if (!me || me.role !== "superadmin") {
    redirect("/auth/login")
  }

  async function saveGeneral(formData: FormData) {
    "use server"
    const siteName = String(formData.get("siteName") || "")
    const tagline = String(formData.get("tagline") || "")
    console.debug("[settings] saveGeneral", { siteName, tagline })
    revalidatePath("/dashboard/superadmin/settings")
  }

  async function saveSeo(formData: FormData) {
    "use server"
    const metaTitle = String(formData.get("metaTitle") || "")
    const metaDescription = String(formData.get("metaDescription") || "")
    console.debug("[settings] saveSeo", { metaTitle, metaDescription })
    revalidatePath("/dashboard/superadmin/settings")
  }

  async function saveEmail(formData: FormData) {
    "use server"
    const fromName = String(formData.get("fromName") || "")
    const fromAddress = String(formData.get("fromAddress") || "")
    console.debug("[settings] saveEmail", { fromName, fromAddress })
    revalidatePath("/dashboard/superadmin/settings")
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">System Settings</h1>
          <p className="text-slate-600 mt-2">Configure site-wide options</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General */}
          <Card>
            <CardHeader>
              <CardTitle>General</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={saveGeneral} className="space-y-4">
                <div>
                  <Label htmlFor="siteName">Site name</Label>
                  <Input id="siteName" name="siteName" placeholder="Tuganire News" />
                </div>
                <div>
                  <Label htmlFor="tagline">Brand tagline</Label>
                  <Input id="tagline" name="tagline" placeholder="Trusted stories. Clear voices." />
                </div>
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700">Save General</Button>
              </form>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={saveSeo} className="space-y-4">
                <div>
                  <Label htmlFor="metaTitle">Default meta title</Label>
                  <Input id="metaTitle" name="metaTitle" placeholder="Tuganire News" />
                </div>
                <div>
                  <Label htmlFor="metaDescription">Default meta description</Label>
                  <Textarea id="metaDescription" name="metaDescription" rows={3} placeholder="Your trusted destination for news, analysis, and perspectives." />
                </div>
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700">Save SEO</Button>
              </form>
            </CardContent>
          </Card>

          {/* Email */}
          <Card>
            <CardHeader>
              <CardTitle>Email</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={saveEmail} className="space-y-4">
                <div>
                  <Label htmlFor="fromName">From name</Label>
                  <Input id="fromName" name="fromName" placeholder="Tuganire News" />
                </div>
                <div>
                  <Label htmlFor="fromAddress">From address</Label>
                  <Input id="fromAddress" name="fromAddress" placeholder="no-reply@tuganire.example" />
                </div>
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700">Save Email</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
