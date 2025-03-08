"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/components/providers/supabase-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export default function Analytics() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalProjects: 0,
    totalRevenue: 0,
  })
  const [monthlyData, setMonthlyData] = useState([])

  useEffect(() => {
    fetchStats()
    fetchMonthlyData()
  }, [])

  const fetchStats = async () => {
    try {
      const { data: users, error: usersError } = await supabase.from("profiles").select("id", { count: "exact" })

      const { data: jobs, error: jobsError } = await supabase.from("jobs").select("id", { count: "exact" })

      const { data: projects, error: projectsError } = await supabase
        .from("projects")
        .select("id, amount", { count: "exact" })

      if (usersError || jobsError || projectsError) throw error

      const totalRevenue = projects.reduce((sum, project) => sum + project.amount, 0)

      setStats({
        totalUsers: users.length,
        totalJobs: jobs.length,
        totalProjects: projects.length,
        totalRevenue,
      })
    } catch (error) {
      toast({
        title: "Error fetching analytics",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const fetchMonthlyData = async () => {
    // This is a placeholder. In a real application, you would fetch this data from your database
    // with proper aggregation queries.
    const mockData = [
      { name: "Jan", users: 100, jobs: 50, projects: 30, revenue: 5000 },
      { name: "Feb", users: 120, jobs: 60, projects: 35, revenue: 5500 },
      { name: "Mar", users: 140, jobs: 70, projects: 40, revenue: 6000 },
      { name: "Apr", users: 160, jobs: 80, projects: 45, revenue: 6500 },
      { name: "May", users: 180, jobs: 90, projects: 50, revenue: 7000 },
      { name: "Jun", users: 200, jobs: 100, projects: 55, revenue: 7500 },
    ]
    setMonthlyData(mockData)
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalUsers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalJobs}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalProjects}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="users" fill="#8884d8" />
              <Bar dataKey="jobs" fill="#82ca9d" />
              <Bar dataKey="projects" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

