"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Comment = {
  id: string
  article_slug: string
  name: string
  email: string | null
  content: string
  status: string
  created_at: string
}

export default function CommentsModerationTable() {
  const [items, setItems] = useState<Comment[]>([])
  const [status, setStatus] = useState<"pending"|"approved"|"rejected">("pending")
  const [q, setQ] = useState("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ status, page: String(page), pageSize: "20" })
      if (q.trim()) params.set("q", q.trim())
      const res = await fetch(`/api/admin/comments/moderation?${params.toString()}`)
      const data = await res.json()
      setItems(data.items || [])
      setTotal(data.total || 0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [status, page])

  const act = async (id: string, action: "approve"|"reject"|"delete") => {
    const res = await fetch(`/api/admin/comments/moderation`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action }) })
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      alert(d.error || "Action failed")
      return
    }
    await load()
  }

  const totalPages = Math.max(1, Math.ceil(total / 20))

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2">
        <div className="flex gap-2">
          {(["pending","approved","rejected"] as const).map((s) => (
            <Button key={s} variant={status===s?"default":"outline"} size="sm" onClick={() => { setStatus(s); setPage(1) }}>{s[0].toUpperCase()+s.slice(1)}</Button>
          ))}
        </div>
        <div className="ml-auto flex gap-2">
          <Input placeholder="Search name/content" value={q} onChange={(e)=>setQ(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter'){ setPage(1); load() }}} />
          <Button size="sm" onClick={()=>{ setPage(1); load() }}>Search</Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded border">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-2 text-left">When</th>
              <th className="p-2 text-left">Article</th>
              <th className="p-2 text-left">Author</th>
              <th className="p-2 text-left">Content</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-3" colSpan={5}>Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td className="p-3" colSpan={5}>No comments.</td></tr>
            ) : items.map((c)=> (
              <tr key={c.id} className="border-t">
                <td className="p-2 whitespace-nowrap">{new Date(c.created_at).toLocaleString()}</td>
                <td className="p-2"><a href={`/articles/${c.article_slug}`} className="text-blue-600 hover:underline">{c.article_slug}</a></td>
                <td className="p-2">{c.name}{c.email?` • ${c.email}`:''}</td>
                <td className="p-2 max-w-[420px]"><div className="line-clamp-3">{c.content}</div></td>
                <td className="p-2">
                  <div className="flex gap-2">
                    {status!=="approved" && <Button size="sm" onClick={()=>act(c.id,"approve")}>Approve</Button>}
                    {status!=="rejected" && <Button size="sm" variant="outline" onClick={()=>act(c.id,"reject")}>Reject</Button>}
                    <Button size="sm" variant="destructive" onClick={()=>act(c.id,"delete")}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">Page {page} / {totalPages}</div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</Button>
          <Button size="sm" variant="outline" disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Next</Button>
        </div>
      </div>
    </div>
  )
}
