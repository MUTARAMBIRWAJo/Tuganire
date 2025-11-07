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
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) console.error("getSession error", error)
      console.debug("[auth] initial session", session)
      setUser(session?.user ?? null)
      if (session?.user) {
        supabase
          .rpc("get_my_app_user")
          .single()
          .then(({ data, error }) => {
            if (error) console.error("get_my_app_user error", error)
            setProfile((data as AppUser) || null)
            setLoading(false)
          })
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.debug("[auth] onAuthStateChange", _event, session)
      setUser(session?.user ?? null)
      if (session?.user) {
        supabase
          .rpc("get_my_app_user")
          .single()
          .then(({ data, error }) => {
            if (error) console.error("get_my_app_user error", error)
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
