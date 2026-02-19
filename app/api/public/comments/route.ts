import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })

    const { article_slug, name, email, content, website } = body || {}
    // Honeypot: if website filled, treat as spam
    if (typeof website === 'string' && website.trim() !== '') {
      return NextResponse.json({ ok: true }, { status: 200 })
    }
    if (!article_slug || !content || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    // Basic rate limit: max 3 comments per 5 minutes per IP or email
    const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '').split(',')[0].trim() || null
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const LIMIT = 3
    const WINDOW_SEC = 5 * 60
    const { count: ipCount } = await supabase
      .from('comments')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', fiveMinAgo)
      .or(
        [
          ip ? `ip.eq.${ip}` : '',
          email ? `email.eq.${email}` : ''
        ].filter(Boolean).join(',')
      )
    const used = ipCount ?? 0
    const remaining = Math.max(0, LIMIT - used)
    if (used >= LIMIT) {
      const res = NextResponse.json({ error: "Too many comments, please try again later." }, { status: 429 })
      res.headers.set('X-RateLimit-Limit', String(LIMIT))
      res.headers.set('X-RateLimit-Remaining', '0')
      res.headers.set('Retry-After', String(WINDOW_SEC))
      return res
    }

    const { data, error } = await supabase
      .from("comments")
      .insert({ article_slug, name, email: email || null, content, status: 'pending', ip })
      .select("id, created_at")
      .single()

    if (error) {
      return NextResponse.json({ error: error.message || "Failed to create comment" }, { status: 500 })
    }

    const res = NextResponse.json({ ok: true, id: data?.id, created_at: data?.created_at })
    res.headers.set('X-RateLimit-Limit', String(LIMIT))
    res.headers.set('X-RateLimit-Remaining', String(Math.max(0, remaining - 1)))
    return res
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
