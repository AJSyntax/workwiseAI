'use client'

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { SupabaseClient } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Database } from '@/types/supabase'

interface AnalyticsDashboardProps {
  supabase: SupabaseClient<Database>
}

export function AnalyticsDashboard({ supabase }: AnalyticsDashboardProps) {
  const { toast } = useToast()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalApplications: 0,
    totalMessages: 0,
  })

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      // Fetch total users
      const { count: userCount, error: userError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      if (userError) throw userError

      // Fetch total jobs
      const { count: jobCount, error: jobError } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })

      if (jobError) throw jobError

      // Fetch total applications
      const { count: applicationCount, error: applicationError } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })

      if (applicationError) throw applicationError

      // Fetch total messages
      const { count: messageCount, error: messageError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })

      if (messageError) throw messageError

      setStats({
        totalUsers: userCount || 0,
        totalJobs: jobCount || 0,
        totalApplications: applicationCount || 0,
        totalMessages: messageCount || 0,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      toast({
        title: "Error fetching analytics",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const data = [
    {
      name: 'Users',
      value: stats.totalUsers,
    },
    {
      name: 'Jobs',
      value: stats.totalJobs,
    },
    {
      name: 'Applications',
      value: stats.totalApplications,
    },
    {
      name: 'Messages',
      value: stats.totalMessages,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
          <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalApplications}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalMessages}</div>
        </CardContent>
      </Card>

      <div className="col-span-4 h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
