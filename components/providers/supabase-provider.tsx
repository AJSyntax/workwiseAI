"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import type { SupabaseClient, User } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

type SupabaseContext = {
  supabase: SupabaseClient<Database>
  user: User | null
  userRole: string | null
  loading: boolean
  error: string | null
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Check if environment variables are set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Create Supabase client only if environment variables are available
  let supabase: SupabaseClient<Database> | null = null
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient<Database> | null>(null)

  useEffect(() => {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Supabase URL or Anonymous Key is missing. Please check your environment variables.")
      }
      const client = createClientComponentClient<Database>()
      setSupabaseClient(client)
      supabase = client
    } catch (err: any) {
      console.error("Failed to initialize Supabase client:", err.message)
      setError(err.message)
      setLoading(false)

      // Return a minimal provider with error state to prevent further errors
      const value = {
        // @ts-ignore - This is a fallback for when Supabase client creation fails
        supabase: null,
        user: null,
        userRole: null,
        loading: false,
        error: err.message,
      }

      return <Context.Provider value={value}>{children}</Context.Provider>
    }
  }, [supabaseAnonKey, supabaseUrl])

  useEffect(() => {
    if (!supabaseClient) {
      return
    }

    const getUser = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabaseClient.auth.getSession()

        if (sessionError) throw sessionError

        setUser(session?.user ?? null)

        if (session?.user) {
          const { data, error: profileError } = await supabaseClient
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

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        try {
          const { data } = await supabaseClient.from("profiles").select("role").eq("id", session.user.id).single()

          setUserRole(data?.role ?? null)
        } catch (err) {
          console.error("Error fetching user role:", err)
        }
      }

      router.refresh()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabaseClient])

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

