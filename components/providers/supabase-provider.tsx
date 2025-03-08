"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import type { Database } from "@/types/supabase"

type SupabaseContext = {
  supabase: SupabaseClient<Database> | null
  user: any | null
  userRole: string | null
  loading: boolean
  error: string | null
}

const Context = createContext<SupabaseContext>({
  supabase: null,
  user: null,
  userRole: null,
  loading: true,
  error: null,
})

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient<Database> | null>(null)

  useEffect(() => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Supabase URL or Anonymous Key is missing. Please check your environment variables.")
      }

      const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
      setSupabaseClient(supabase)

      const getUser = async () => {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession()

          setUser(session?.user ?? null)

          if (session?.user) {
            const { data, error: profileError } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", session.user.id)
              .single()

            if (profileError) throw profileError

            setUserRole(data?.role ?? null)
          }
        } catch (err: any) {
          console.error("Error fetching user session:", err.message)
          setError(err.message)
        } finally {
          setLoading(false)
        }
      }

      getUser()

      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        setUser(session?.user ?? null)

        if (session?.user) {
          try {
            const { data } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

            setUserRole(data?.role ?? null)
          } catch (err) {
            console.error("Error fetching user role:", err)
          }
        }

        router.refresh()
      })

      return () => {
        authListener?.subscription.unsubscribe()
      }
    } catch (err: any) {
      console.error("Error initializing Supabase client:", err.message)
      setError(err.message)
      setLoading(false)
      return () => {}
    }
  }, [router])

  const value = {
    supabase: supabaseClient,
    user,
    userRole,
    loading,
    error,
  }

  return <Context.Provider value={value}>{children}</Context.Provider>
}

export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error("useSupabase must be used within a SupabaseProvider")
  }
  return context
}
