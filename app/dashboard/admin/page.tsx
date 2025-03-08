"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/components/providers/supabase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Briefcase, AlertTriangle, DollarSign } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const { supabase } = useSupabase()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    activeDisputes: 0,
    totalRevenue: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      // Fetch total users
      const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

      // Fetch total jobs
      const { count: totalJobs } = await supabase.from("jobs").select("*", { count: "exact", head: true })

      // Fetch active disputes
      const { count: activeDisputes } = await supabase
        .from("disputes")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending")

      // Fetch total revenue (assuming 10% platform fee)
      const { data: completedProjects } = await supabase.from("projects").select("amount").eq("status", "completed")

      const totalRevenue = completedProjects?.reduce((sum, project) => sum + project.amount * 0.1, 0) || 0

      setStats({
        totalUsers: totalUsers || 0,
        totalJobs: totalJobs || 0,
        activeDisputes: activeDisputes || 0,
        totalRevenue: totalRevenue,
      })
    }

    fetchStats()
  }, [supabase])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.totalJobs}</div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Disputes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.activeDisputes}</div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Newly registered users</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Add a list of recent users here */}
            <p>No recent users found.</p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/admin/users">Manage Users</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Disputes</CardTitle>
            <CardDescription>Recently opened disputes</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Add a list of recent disputes here */}
            <p>No recent disputes found.</p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/admin/disputes">Manage Disputes</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

