import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = await createClient()

    // Get current view count
    const { data: article, error: fetchError } = await supabase
      .from("articles")
      .select("views_count")
      .eq("slug", slug)
      .eq("status", "published")
      .single()

    if (fetchError || !article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 })
    }

    // Increment view count (non-blocking)
    const { error: updateError } = await supabase
      .from("articles")
      .update({ views_count: (article.views_count || 0) + 1 })
      .eq("slug", slug)

    if (updateError) {
      console.error("Failed to increment view count:", updateError)
      // Don't fail the request if view count update fails
    }

    return NextResponse.json({ 
      success: true,
      views: (article.views_count || 0) + 1 
    })
  } catch (error) {
    console.error("Error in view counter:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Allow GET for tracking without blocking (optional)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  return POST(req, { params })
}

