"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import type { User } from "@supabase/supabase-js"
import type { AppUser } from "@/lib/types"

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
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
    await supabase.auth.signOut()
  }

  return { user, profile, role: profile?.role, loading, signOut }
}
