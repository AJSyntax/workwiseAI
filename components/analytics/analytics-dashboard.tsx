'use client'

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SupabaseClient } from '@supabase/supabase-js'

interface AnalyticsDashboardProps {
  supabase: SupabaseClient
}

export function AnalyticsDashboard({ supabase }: AnalyticsDashboardProps) {
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
      const { data: users, error: usersError } = await supabase
        .from("profiles")
        .select("*", { count: "exact" })

      const { data: jobs, error: jobsError } = await supabase
        .from("jobs")
        .select("*", { count: "exact" })

      const { data: projects, error: projectsError } = await supabase
        .from("projects")
        .select("id, amount", { count: "exact" })

      if (usersError || jobsError || projectsError) {
        throw new Error("Failed to fetch analytics data")
      }

      const totalRevenue = projects?.reduce((sum, project) => sum + (project.amount || 0), 0) || 0
      const totalUsers = users?.length || 0
      const totalJobs = jobs?.length || 0

      setStats({
        totalUsers,
        totalJobs,
        totalProjects: projects?.length || 0,
        totalRevenue,
      })
    } catch (error) {
      console.error("Error fetching analytics:", error)
      toast({
        title: "Error fetching analytics",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const fetchMonthlyData = async () => {
    try {
      const { data: projects, error } = await supabase
        .from("projects")
        .select("created_at, amount")
        .order("created_at")

      if (error) throw error

      const monthlyStats = projects.reduce((acc, project) => {
        const date = new Date(project.created_at)
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`

        if (!acc[monthYear]) {
          acc[monthYear] = {
            name: monthYear,
            revenue: 0,
            projects: 0,
          }
        }

        acc[monthYear].revenue += project.amount
        acc[monthYear].projects += 1

        return acc
      }, {})

      setMonthlyData(Object.values(monthlyStats))
    } catch (error) {
      toast({
        title: "Error fetching monthly data",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Monthly Revenue & Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" fill="#8884d8" name="Revenue ($)" />
                <Bar yAxisId="right" dataKey="projects" fill="#82ca9d" name="Projects" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
