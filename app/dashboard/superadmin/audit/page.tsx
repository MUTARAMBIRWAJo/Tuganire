import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function SuperAdminAuditPage({
  searchParams,
}: { searchParams: { q?: string; action?: string; table?: string; from?: string; to?: string; page?: string } }) {
  const me = await getCurrentUser()
  if (!me || me.role !== "superadmin") redirect("/auth/login")

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabase = serviceKey && url
    ? createServiceClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
    : await createClient()
  const q = (searchParams?.q || "").trim()
  const action = (searchParams?.action || "").trim()
  const table = (searchParams?.table || "").trim()
  const fromDate = (searchParams?.from || "").trim()
  const toDate = (searchParams?.to || "").trim()
  const page = Math.max(1, parseInt(searchParams?.page || "1", 10) || 1)
  const PAGE_SIZE = 20
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from("audits")
    .select("id, table_name, row_id, action, changed_by, diff, created_at", { count: "exact" })

  if (q) query = query.ilike("row_id", `%${q}%`)
  if (action) query = query.eq("action", action)
  if (table) query = query.eq("table_name", table)
  if (fromDate) query = query.gte("created_at", fromDate)
  if (toDate) query = query.lte("created_at", toDate)

  const { data: logs, count } = await query.order("created_at", { ascending: false }).range(from, to)

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Audit Logs</h1>
          <p className="text-slate-600 mt-2">Track administrative actions and critical events</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Log Entries</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <form className="mb-4 grid grid-cols-1 md:grid-cols-5 gap-3" action="/dashboard/superadmin/audit" method="get">
              <div>
                <Label htmlFor="q">Row ID</Label>
                <Input id="q" name="q" placeholder="row id contains..." defaultValue={q} />
              </div>
              <div>
                <Label htmlFor="table">Table</Label>
                <Input id="table" name="table" placeholder="articles, categories..." defaultValue={table} />
              </div>
              <div>
                <Label htmlFor="action">Action</Label>
                <Input id="action" name="action" placeholder="insert | update | delete" defaultValue={action} />
              </div>
              <div>
                <Label htmlFor="from">From</Label>
                <Input id="from" name="from" type="datetime-local" defaultValue={fromDate} />
              </div>
              <div>
                <Label htmlFor="to">To</Label>
                <Input id="to" name="to" type="datetime-local" defaultValue={toDate} />
              </div>
              <div className="md:col-span-5 flex items-end"><Button type="submit">Filter</Button></div>
            </form>

            {/* Table */}
            <div className="overflow-auto rounded border bg-white">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="text-left p-2">Time</th>
                    <th className="text-left p-2">Table</th>
                    <th className="text-left p-2">Action</th>
                    <th className="text-left p-2">Row</th>
                    <th className="text-left p-2">Changed By</th>
                    <th className="text-left p-2">Diff</th>
                  </tr>
                </thead>
                <tbody>
                  {(logs || []).map((l) => (
                    <tr key={l.id} className="border-t">
                      <td className="p-2 whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</td>
                      <td className="p-2">{l.table_name}</td>
                      <td className="p-2 capitalize">{l.action}</td>
                      <td className="p-2">{l.row_id}</td>
                      <td className="p-2">{l.changed_by || "-"}</td>
                      <td className="p-2 max-w-[32rem]">
                        <pre className="text-xs whitespace-pre-wrap break-words">{JSON.stringify(l.diff, null, 2)}</pre>
                      </td>
                    </tr>
                  ))}
                  {(!logs || logs.length === 0) && (
                    <tr>
                      <td className="p-4 text-slate-600" colSpan={6}>No logs found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {count && count > PAGE_SIZE && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-slate-600">Showing {from + 1}-{Math.min(to + 1, count)} of {count}</div>
                <div className="flex gap-2">
                  <Link href={{ pathname: "/dashboard/superadmin/audit", query: { q, action, table, from: fromDate, to: toDate, page: String(Math.max(1, page - 1)) } }} className={`px-3 py-1 rounded border ${page <= 1 ? "pointer-events-none opacity-50" : ""}`}>Prev</Link>
                  <Link href={{ pathname: "/dashboard/superadmin/audit", query: { q, action, table, from: fromDate, to: toDate, page: String(page + 1) } }} className={`px-3 py-1 rounded border ${to + 1 >= (count || 0) ? "pointer-events-none opacity-50" : ""}`}>Next</Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
