import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("comments")
      .select("id, name, content, created_at")
      .eq("article_slug", slug)
      .eq('status', 'approved')
      .order("created_at", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message || "Failed to fetch comments" }, { status: 500 })
    }

    return NextResponse.json({ comments: data || [] })
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
