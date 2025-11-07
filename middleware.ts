import { NextResponse, type NextRequest } from "next/server"

// Middleware is deprecated in favor of proxy.ts in this Next.js version.
// Leave as a no-op to avoid deprecation warnings and duplicate behavior.
export async function middleware(_req: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [],
}