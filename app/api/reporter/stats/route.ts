import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "reporter") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }

    const supabase = await createClient()

    const [totalRes, publishedRes, draftRes, pendingRes] = await Promise.all([
      supabase.from("articles").select("*", { count: "exact", head: true }).eq("author_id", user.id),
      supabase
        .from("articles")
        .select("*", { count: "exact", head: true })
        .eq("author_id", user.id)
        .eq("status", "published"),
      supabase
        .from("articles")
        .select("*", { count: "exact", head: true })
        .eq("author_id", user.id)
        .eq("status", "draft"),
      supabase
        .from("articles")
        .select("*", { count: "exact", head: true })
        .eq("author_id", user.id)
        .eq("status", "pending"),
    ])

    const stats = {
      total: totalRes.count || 0,
      published: publishedRes.count || 0,
      drafts: draftRes.count || 0,
      pending: pendingRes.count || 0,
    }

    return NextResponse.json({ ok: true, stats })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "unknown" }, { status: 500 })
  }
}
