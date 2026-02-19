"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import type { User } from "@supabase/supabase-js"
import type { AppUser } from "@/lib/types"

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Create Supabase client with proper browser cookie handling
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            // Browser-side cookie access
            const value = document.cookie
              .split('; ')
              .find(row => row.startsWith(`${name}=`))
              ?.split('=')[1]
            return value
          },
          set(name, value, options) {
            // Browser-side cookie setting
            let cookieString = `${name}=${value}`
            if (options?.path) cookieString += `; path=${options.path}`
            if (options?.maxAge) cookieString += `; max-age=${options.maxAge}`
            if (options?.domain) cookieString += `; domain=${options.domain}`
            if (options?.sameSite) cookieString += `; samesite=${options.sameSite}`
            if (options?.secure) cookieString += `; secure`
            if (options?.httpOnly) cookieString += `; httponly`
            document.cookie = cookieString
          },
          remove(name, options) {
            // Browser-side cookie removal
            let cookieString = `${name}=`
            if (options?.path) cookieString += `; path=${options.path}`
            if (options?.domain) cookieString += `; domain=${options.domain}`
            cookieString += `; max-age=0`
            document.cookie = cookieString
          },
        },
      },
    )

    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        const msg = String((error as any)?.message || error)
        if (msg.toLowerCase().includes("refresh token")) {
          await supabase.auth.signOut()
        }
        // Avoid noisy logging in production for this known case
        if (process.env.NODE_ENV !== "production") {
          console.warn("[auth] getSession warning", error)
        }
      }
      setUser(session?.user ?? null)
      if (session?.user) {
        supabase
          .rpc("get_my_app_user")
          .single()
          .then(({ data, error }) => {
            if (error && process.env.NODE_ENV !== "production") console.warn("get_my_app_user error", error)
            setProfile((data as AppUser) || null)
            setLoading(false)
          })
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (process.env.NODE_ENV !== "production") {
        console.debug("[auth] onAuthStateChange", _event)
      }
      setUser(session?.user ?? null)
      if (session?.user) {
        supabase
          .rpc("get_my_app_user")
          .single()
          .then(({ data, error }) => {
            if (error && process.env.NODE_ENV !== "production") console.warn("get_my_app_user error", error)
            setProfile((data as AppUser) || null)
            setLoading(false)
          })
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    // Create Supabase client with same cookie handling for signOut
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            const value = document.cookie
              .split('; ')
              .find(row => row.startsWith(`${name}=`))
              ?.split('=')[1]
            return value
          },
          set(name, value, options) {
            let cookieString = `${name}=${value}`
            if (options?.path) cookieString += `; path=${options.path}`
            if (options?.maxAge) cookieString += `; max-age=${options.maxAge}`
            if (options?.domain) cookieString += `; domain=${options.domain}`
            if (options?.sameSite) cookieString += `; samesite=${options.sameSite}`
            if (options?.secure) cookieString += `; secure`
            if (options?.httpOnly) cookieString += `; httponly`
            document.cookie = cookieString
          },
          remove(name, options) {
            let cookieString = `${name}=`
            if (options?.path) cookieString += `; path=${options.path}`
            if (options?.domain) cookieString += `; domain=${options.domain}`
            cookieString += `; max-age=0`
            document.cookie = cookieString
          },
        },
      },
    )
    await supabase.auth.signOut()
  }

  return { user, profile, role: profile?.role, loading, signOut }
}
