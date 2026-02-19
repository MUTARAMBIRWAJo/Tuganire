import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Database, Search, Filter } from "lucide-react"

export default async function SuperAdminLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    table?: string
    action?: string
    q?: string
    from?: string
    to?: string
    page?: string
  }>
}) {
  const me = await getCurrentUser()
  if (!me || me.role !== "superadmin") redirect("/auth/login")

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabase = serviceKey && url
    ? createServiceClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
    : await createClient()

  const sp = await searchParams
  const table = (sp?.table || "").trim()
  const action = (sp?.action || "").trim()
  const q = (sp?.q || "").trim()
  const fromDate = (sp?.from || "").trim()
  const toDate = (sp?.to || "").trim()
  const page = Math.max(1, parseInt(sp?.page || "1", 10) || 1)
  const PAGE_SIZE = 50
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  // Build query
  let query = supabase
    .from("audits")
    .select("id, table_name, row_id, action, changed_by, diff, created_at", { count: "exact" })

  if (q) query = query.ilike("row_id", `%${q}%`)
  if (table) query = query.eq("table_name", table)
  if (action) query = query.eq("action", action)
  if (fromDate) query = query.gte("created_at", fromDate)
  if (toDate) query = query.lte("created_at", toDate)

  const { data: logs, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to)

  // Get unique tables and actions for filters
  const { data: allLogs } = await supabase
    .from("audits")
    .select("table_name, action")
    .limit(1000)

  const uniqueTables = Array.from(new Set(allLogs?.map((l) => l.table_name).filter(Boolean) || []))
  const uniqueActions = Array.from(new Set(allLogs?.map((l) => l.action).filter(Boolean) || []))

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">System Logs</h1>
          <p className="text-slate-600 mt-2">View detailed system activity and change logs</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Activity Logs</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <form className="mb-6 grid grid-cols-1 md:grid-cols-6 gap-3" action="/dashboard/superadmin/logs" method="get">
              <div>
                <Label htmlFor="q">Search</Label>
                <Input id="q" name="q" placeholder="Row ID..." defaultValue={q} />
              </div>
              <div>
                <Label htmlFor="table">Table</Label>
                <Input id="table" name="table" placeholder="articles, users..." defaultValue={table} list="tables" />
                <datalist id="tables">
                  {uniqueTables.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </div>
              <div>
                <Label htmlFor="action">Action</Label>
                <Input id="action" name="action" placeholder="insert, update..." defaultValue={action} list="actions" />
                <datalist id="actions">
                  {uniqueActions.map((a) => (
                    <option key={a} value={a} />
                  ))}
                </datalist>
              </div>
              <div>
                <Label htmlFor="from">From</Label>
                <Input id="from" name="from" type="datetime-local" defaultValue={fromDate} />
              </div>
              <div>
                <Label htmlFor="to">To</Label>
                <Input id="to" name="to" type="datetime-local" defaultValue={toDate} />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </form>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                Error loading logs: {error.message}
              </div>
            )}

            {/* Logs Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="text-left p-3">Timestamp</th>
                    <th className="text-left p-3">Table</th>
                    <th className="text-left p-3">Action</th>
                    <th className="text-left p-3">Row ID</th>
                    <th className="text-left p-3">Changed By</th>
                    <th className="text-left p-3">Changes</th>
                  </tr>
                </thead>
                <tbody>
                  {(logs || []).map((log) => (
                    <tr key={log.id} className="border-b hover:bg-slate-50">
                      <td className="p-3 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {log.table_name}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          log.action === "insert" ? "bg-green-100 text-green-700" :
                          log.action === "update" ? "bg-yellow-100 text-yellow-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-xs">{log.row_id}</td>
                      <td className="p-3 text-xs">{log.changed_by || "-"}</td>
                      <td className="p-3 max-w-md">
                        <details className="cursor-pointer">
                          <summary className="text-xs text-slate-600 hover:text-slate-900">
                            View changes
                          </summary>
                          <pre className="mt-2 text-xs bg-slate-100 p-2 rounded overflow-auto max-h-32">
                            {JSON.stringify(log.diff, null, 2)}
                          </pre>
                        </details>
                      </td>
                    </tr>
                  ))}
                  {(!logs || logs.length === 0) && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-600">
                        <Database className="h-12 w-12 mx-auto mb-2 text-slate-400" />
                        <p>No logs found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {count && count > PAGE_SIZE && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-slate-600">
                  Showing {from + 1}-{Math.min(to + 1, count)} of {count}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={{
                      pathname: "/dashboard/superadmin/logs",
                      query: { table, action, q, from: fromDate, to: toDate, page: String(Math.max(1, page - 1)) },
                    }}
                    className={`px-3 py-1 rounded border ${page <= 1 ? "pointer-events-none opacity-50" : ""}`}
                  >
                    Prev
                  </Link>
                  <Link
                    href={{
                      pathname: "/dashboard/superadmin/logs",
                      query: { table, action, q, from: fromDate, to: toDate, page: String(page + 1) },
                    }}
                    className={`px-3 py-1 rounded border ${to + 1 >= (count || 0) ? "pointer-events-none opacity-50" : ""}`}
                  >
                    Next
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

