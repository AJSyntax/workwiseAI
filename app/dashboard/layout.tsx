"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/components/providers/supabase-provider"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  User,
  LogOut,
  Home,
  Briefcase,
  Users,
  MessageSquare,
  CreditCard,
  AlertTriangle,
  Settings,
  BarChart,
} from "lucide-react"
import { NotificationBell } from "@/components/notification-bell"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { supabase, user, userRole, loading, error } = useSupabase()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user && !error) {
      router.push("/login")
    }
  }, [user, loading, router, error])

  // Handle Supabase initialization error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-bold text-red-700 mb-4">Configuration Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-gray-700 mb-4">
            Please check your environment variables and make sure they are correctly set up.
          </p>
          <Button onClick={() => router.push("/")} variant="outline">
            Return to Home
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader className="border-b">
            <div className="p-2">
              <h2 className="text-xl font-bold">WORKWISE AI</h2>
              <p className="text-sm text-muted-foreground">
                {userRole === "freelancer" && "Freelancer Dashboard"}
                {userRole === "employer" && "Employer Dashboard"}
                {userRole === "admin" && "Admin Dashboard"}
              </p>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/dashboard">
                      <Home className="h-4 w-4" />
                      <span>Dashboard</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {userRole === "freelancer" && (
                  <>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <a href="/dashboard/freelancer/jobs">
                          <Briefcase className="h-4 w-4" />
                          <span>Available Jobs</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <a href="/dashboard/freelancer/projects">
                          <Briefcase className="h-4 w-4" />
                          <span>My Projects</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <a href="/dashboard/freelancer/skills">
                          <BarChart className="h-4 w-4" />
                          <span>Skill Assessment</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                )}

                {userRole === "employer" && (
                  <>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <a href="/dashboard/employer/post-job">
                          <Briefcase className="h-4 w-4" />
                          <span>Post a Job</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <a href="/dashboard/employer/jobs">
                          <Briefcase className="h-4 w-4" />
                          <span>My Jobs</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <a href="/dashboard/employer/projects">
                          <Briefcase className="h-4 w-4" />
                          <span>Active Projects</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <a href="/dashboard/employer/talent">
                          <Users className="h-4 w-4" />
                          <span>Find Talent</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                )}

                {userRole === "admin" && (
                  <>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <a href="/dashboard/admin/users">
                          <Users className="h-4 w-4" />
                          <span>Manage Users</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <a href="/dashboard/admin/jobs">
                          <Briefcase className="h-4 w-4" />
                          <span>Manage Jobs</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <a href="/dashboard/admin/disputes">
                          <AlertTriangle className="h-4 w-4" />
                          <span>Disputes</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <a href="/dashboard/admin/analytics">
                          <BarChart className="h-4 w-4" />
                          <span>Analytics</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                )}

                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/dashboard/messages">
                      <MessageSquare className="h-4 w-4" />
                      <span>Messages</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/dashboard/payments">
                      <CreditCard className="h-4 w-4" />
                      <span>Payments</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/dashboard/settings">
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{user.email}</p>
                <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => supabase?.auth.signOut().then(() => router.push("/"))}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1">
          <header className="border-b p-4 flex justify-between items-center">
            <h1 className="text-xl font-bold">WORKWISE AI</h1>
            <div className="flex items-center gap-4">
              <NotificationBell />
              <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/settings")}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </header>
          <main className="p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}

