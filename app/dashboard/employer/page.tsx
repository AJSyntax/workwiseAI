"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/components/providers/supabase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Briefcase, Users, MessageSquare, CreditCard } from "lucide-react"
import Link from "next/link"

export default function EmployerDashboard() {
  const { supabase, user } = useSupabase()
  const [stats, setStats] = useState({
    activeJobs: 0,
    activeProjects: 0,
    unreadMessages: 0,
    totalSpent: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return

      // Fetch active jobs
      const { count: activeJobs } = await supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .eq("employer_id", user.id)
        .eq("status", "open")

      // Fetch active projects
      const { count: activeProjects } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("employer_id", user.id)
        .eq("status", "in_progress")

      // Fetch unread messages
      const { count: unreadMessages } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("recipient_id", user.id)
        .eq("read", false)

      // Fetch total spent
      const { data: spent } = await supabase
        .from("projects")
        .select("amount")
        .eq("employer_id", user.id)
        .eq("status", "completed")

      const totalSpent = spent?.reduce((sum, project) => sum + project.amount, 0) || 0

      setStats({
        activeJobs: activeJobs || 0,
        activeProjects: activeProjects || 0,
        unreadMessages: unreadMessages || 0,
        totalSpent: totalSpent,
      })
    }

    fetchStats()
  }, [user, supabase])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Employer Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.activeJobs}</div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.activeProjects}</div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unread Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.unreadMessages}</div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">${stats.totalSpent.toFixed(2)}</div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Job Postings</CardTitle>
            <CardDescription>Your recently posted jobs</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Add a list of recent job postings here */}
            <p>No recent job postings found.</p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/employer/jobs">View All Jobs</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Projects</CardTitle>
            <CardDescription>Your ongoing projects</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Add a list of active projects here */}
            <p>No active projects found.</p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/employer/projects">View All Projects</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

