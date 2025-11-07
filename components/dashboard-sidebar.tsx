"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import {
  Home,
  FileText,
  Users,
  Settings,
  LogOut,
  BarChart3,
  Mail,
  MessageSquare,
  ShieldCheck,
  Edit,
  Clock,
  PieChart,
  User,
  CheckCircle,
  Tag,
  FolderTree,
  Activity,
  AlertTriangle,
  Database,
  FileBarChart,
  ScrollText,
  HardDrive,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSupabaseAuth } from "@/hooks/use-supabase-auth"
import { useRouter } from "next/navigation"
import { brandFromHost } from "@/lib/host"
import { useEffect, useState } from "react"

interface NavLink {
  name: string
  icon: any
  path: string
}

const roleLinks: Record<string, NavLink[]> = {
  superadmin: [
    { name: "Dashboard", icon: Home, path: "/dashboard/superadmin" },
    { name: "Manage Users", icon: Users, path: "/dashboard/superadmin/users" },
    { name: "Manage Articles", icon: FileText, path: "/dashboard/superadmin/articles" },
    { name: "Moderation Queue", icon: CheckCircle, path: "/dashboard/superadmin/moderation" },
    { name: "Approvals", icon: ShieldCheck, path: "/dashboard/superadmin/approvals" },
    { name: "Categories", icon: FolderTree, path: "/dashboard/superadmin/categories" },
    { name: "Tags", icon: Tag, path: "/dashboard/superadmin/tags" },
    { name: "Analytics", icon: BarChart3, path: "/dashboard/superadmin/analytics" },
    { name: "Reports", icon: FileBarChart, path: "/dashboard/superadmin/reports" },
    { name: "System Logs", icon: ScrollText, path: "/dashboard/superadmin/logs" },
    { name: "Storage Management", icon: HardDrive, path: "/dashboard/superadmin/storage" },
    { name: "System Health", icon: Activity, path: "/dashboard/superadmin/health" },
    { name: "Audit Logs", icon: Database, path: "/dashboard/superadmin/audit" },
    { name: "System Settings", icon: Settings, path: "/dashboard/superadmin/settings" },
  ],
  admin: [
    { name: "Dashboard", icon: Home, path: "/dashboard/admin" },
    { name: "Articles", icon: FileText, path: "/dashboard/articles" },
    { name: "Reporters", icon: Users, path: "/dashboard/admin/reporters" },
    { name: "Comments", icon: MessageSquare, path: "/dashboard/admin/comments" },
    { name: "Analytics", icon: BarChart3, path: "/dashboard/admin/analytics" },
    { name: "Newsletter", icon: Mail, path: "/dashboard/newsletter" },
  ],
  reporter: [
    { name: "My Articles", icon: FileText, path: "/dashboard/reporter" },
    { name: "Create Article", icon: Edit, path: "/dashboard/articles/new" },
    { name: "Drafts", icon: Clock, path: "/dashboard/reporter/drafts" },
    { name: "Statistics", icon: PieChart, path: "/dashboard/reporter/stats" },
    { name: "Profile", icon: User, path: "/dashboard/reporter/profile" },
  ],
}

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { profile, signOut } = useSupabaseAuth()
  const [hostBrand, setHostBrand] = useState<string | null>(null)
  useEffect(() => {
    setHostBrand(brandFromHost(window.location.host))
  }, [])

  const links = roleLinks[profile?.role?.toLowerCase() || "reporter"] || roleLinks.reporter

  const handleSignOut = async () => {
    await signOut()
    router.push("/auth/login")
  }

  return (
    <aside className="w-64 bg-slate-900 text-white md:h-screen md:sticky md:top-0 overflow-y-auto p-5 pb-6 flex flex-col scrollbar-thin">
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/placeholder-logo.png"
            alt="Tuganire News logo"
            width={40}
            height={40}
            className="h-8 w-8"
            priority
          />
          <span className="text-xl font-bold text-yellow-400">Tuganire News</span>
        </Link>
        <p className="text-xs text-slate-400 mt-1" suppressHydrationWarning>
          {hostBrand ? `${hostBrand} Dashboard` : "News Management"}
        </p>
      </div>

      <nav className="flex-1">
        <ul className="space-y-2">
          {links.map(({ name, icon: Icon, path }) => {
            const isActive = pathname === path
            return (
              <li key={name}>
                <Link
                  href={path}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-yellow-400 text-slate-900 font-medium"
                      : "hover:bg-slate-800 text-slate-300 hover:text-white",
                  )}
                >
                  <Icon size={20} />
                  <span>{name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-800">
        <div className="mb-4 px-4">
          <p className="text-sm font-medium text-white">{profile?.display_name || "User"}</p>
          <p className="text-xs text-slate-400 capitalize">{profile?.role || "Reporter"}</p>
        </div>
        <Button
          onClick={handleSignOut}
          variant="ghost"
          className="w-full justify-start text-red-400 hover:text-red-500 hover:bg-slate-800"
        >
          <LogOut size={20} className="mr-3" />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  )
}
