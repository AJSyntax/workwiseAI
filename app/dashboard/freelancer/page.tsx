"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/components/providers/supabase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Briefcase, Users, MessageSquare, CreditCard } from "lucide-react"
import Link from "next/link"

export default function FreelancerDashboard() {
  const { supabase, user } = useSupabase()
  const [stats, setStats] = useState({
    availableJobs: 0,
    activeProjects: 0,
    unreadMessages: 0,
    earnings: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return

      // Fetch available jobs
      const { count: availableJobs } = await supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .eq("status", "open")

      // Fetch active projects
      const { count: activeProjects } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("freelancer_id", user.id)
        .eq("status", "in_progress")

      // Fetch unread messages
      const { count: unreadMessages } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("recipient_id", user.id)
        .eq("read", false)

      // Fetch earnings
      const { data: earnings } = await supabase
        .from("projects")
        .select("amount")
        .eq("freelancer_id", user.id)
        .eq("status", "completed")

      const totalEarnings = earnings?.reduce((sum, project) => sum + project.amount, 0) || 0

      setStats({
        availableJobs: availableJobs || 0,
        activeProjects: activeProjects || 0,
        unreadMessages: unreadMessages || 0,
        earnings: totalEarnings,
      })
    }

    fetchStats()
  }, [user, supabase])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Freelancer Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.availableJobs}</div>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">${stats.earnings.toFixed(2)}</div>
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
            <CardTitle>Recent Job Matches</CardTitle>
            <CardDescription>Jobs that match your skills</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Add a list of recent job matches here */}
            <p>No recent job matches found.</p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/freelancer/jobs">View All Jobs</Link>
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
              <Link href="/dashboard/freelancer/projects">View All Projects</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

