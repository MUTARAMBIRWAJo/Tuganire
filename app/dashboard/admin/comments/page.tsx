import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = "force-dynamic"

interface PageProps { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }

export default async function AdminCommentsPage({ searchParams }: PageProps) {
  const user = await getCurrentUser()
  if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
    redirect("/auth/login")
  }

  const supabase = await createClient()
  const sp = (await searchParams) || {}
  const status = typeof sp.status === 'string' ? sp.status : ''
  const from = typeof sp.from === 'string' ? sp.from : ''
  const to = typeof sp.to === 'string' ? sp.to : ''
  const page = Number(sp.page || 1) || 1
  const pageSize = Number(sp.pageSize || 20) || 20
  const offset = (page - 1) * pageSize

  // Base query
  let listQ = supabase
    .from("comments")
    .select("id, author_name, author_email, content, status, created_at, article_slug", { count: 'exact' })
    .order("created_at", { ascending: false })

  if (status && ["approved","pending","rejected"].includes(status)) listQ = listQ.eq("status", status)
  if (from) listQ = listQ.gte("created_at", from)
  if (to) listQ = listQ.lte("created_at", to)

  const { data: comments, count, error } = await listQ.range(offset, offset + pageSize - 1)
  const total = count || 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Comments</h1>
          <p className="text-slate-600 mt-2">Review and moderate recent comments</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Latest Comments</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <form method="get" className="grid gap-3 md:grid-cols-5 mb-4">
              <select name="status" defaultValue={status} className="border rounded px-2 py-2 text-sm">
                <option value="">All statuses</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
              <input type="date" name="from" defaultValue={from} className="border rounded px-2 py-2 text-sm" />
              <input type="date" name="to" defaultValue={to} className="border rounded px-2 py-2 text-sm" />
              <select name="pageSize" defaultValue={String(pageSize)} className="border rounded px-2 py-2 text-sm">
                {[10,20,50,100].map(n => <option key={n} value={n}>{n} / page</option>)}
              </select>
              <button type="submit" className="bg-blue-600 text-white rounded px-3 py-2 text-sm">Apply</button>
            </form>

            {comments && comments.length > 0 ? (
              <div className="divide-y">
                {comments.map((c) => (
                  <div key={c.id} className="py-4 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="text-sm text-slate-500 mb-1">
                        <span className="font-medium text-slate-700">{c.author_name || "Anonymous"}</span>
                        {c.author_email && <span className="ml-2">({c.author_email})</span>}
                        <span className="mx-2">•</span>
                        <span>{new Date(c.created_at).toLocaleString()}</span>
                        {c.article_slug && (
                          <>
                            <span className="mx-2">•</span>
                            <a className="text-blue-600 hover:underline" href={`/articles/${c.article_slug}`} target="_blank" rel="noreferrer">View article</a>
                          </>
                        )}
                      </div>
                      <p className="whitespace-pre-wrap text-slate-800">{c.content}</p>
                      <p className="text-xs mt-1">Status: <span className={`px-1.5 py-0.5 rounded ${c.status === "approved" ? "bg-green-100 text-green-700" : c.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-700"}`}>{c.status}</span></p>
                    </div>
                    {/* Placeholder for actions (approve/reject) via API routes if needed */}
                    <div className="flex flex-col gap-2">
                      <form action={`/api/admin/comments/moderate`} method="post">
                        <input type="hidden" name="id" value={c.id} />
                        <input type="hidden" name="action" value="approve" />
                        <button type="submit" className="text-xs px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700">Approve</button>
                      </form>
                      <form action={`/api/admin/comments/moderate`} method="post">
                        <input type="hidden" name="id" value={c.id} />
                        <input type="hidden" name="action" value="reject" />
                        <button type="submit" className="text-xs px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700">Reject</button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-600 py-12">No recent comments</p>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6 text-sm">
              <div>
                Showing {Math.min(total, offset + 1)}–{Math.min(total, offset + (comments?.length || 0))} of {total}
              </div>
              <div className="flex items-center gap-2">
                {page > 1 && (
                  <a className="px-3 py-1 rounded border" href={`?${new URLSearchParams({ status, from, to, pageSize: String(pageSize), page: String(page-1) }).toString()}`}>Prev</a>
                )}
                {page < totalPages && (
                  <a className="px-3 py-1 rounded border" href={`?${new URLSearchParams({ status, from, to, pageSize: String(pageSize), page: String(page+1) }).toString()}`}>Next</a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
