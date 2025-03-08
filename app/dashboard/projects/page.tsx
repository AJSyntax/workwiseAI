"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useSupabase } from "@/components/providers/supabase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface Project {
  id: string
  job_id: string
  employer_id: string
  freelancer_id: string
  amount: number
  progress: number
  status: string
  jobs: {
    title: string
    description: string
  }
  profiles: {
    full_name: string
  }
}

export default function Projects() {
  const { supabase, user, userRole } = useSupabase()
  const { toast } = useToast()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [message, setMessage] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      let query = supabase
        .from("projects")
        .select(`
          *,
          jobs (
            title,
            description
          ),
          profiles (
            full_name
          )
        `)
        .order("created_at", { ascending: false })

      if (userRole === "freelancer") {
        query = query.eq("freelancer_id", user?.id)
      } else if (userRole === "employer") {
        query = query.eq("employer_id", user?.id)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      setProjects(data || [])
    } catch (error: any) {
      toast({
        title: "Error fetching projects",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedProject || !message) {
      toast({
        title: "Missing message",
        description: "Please enter a message to send.",
        variant: "destructive",
      })
      return
    }

    try {
      setSendingMessage(true)

      const { data, error } = await supabase.from("messages").insert({
        project_id: selectedProject.id,
        sender_id: user?.id,
        content: message,
      })

      if (error) {
        throw error
      }

      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      })

      setMessage("")
    } catch (error: any) {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSendingMessage(false)
    }
  }

  const handleUpdateProgress = async (projectId: string, newProgress: number) => {
    try {
      const { error } = await supabase.from("projects").update({ progress: newProgress }).eq("id", projectId)

      if (error) {
        throw error
      }

      toast({
        title: "Progress updated",
        description: "The project progress has been updated successfully.",
      })

      fetchProjects()
    } catch (error: any) {
      toast({
        title: "Error updating progress",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div>Loading projects...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Projects</h1>

      {projects.length === 0 ? (
        <p>You don't have any active projects.</p>
      ) : (
        <div className="grid gap-6">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <CardTitle>{project.jobs.title}</CardTitle>
                <CardDescription>
                  {userRole === "freelancer" ? "Client" : "Freelancer"}: {project.profiles.full_name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{project.jobs.description}</p>
                <div className="mb-4">
                  <strong>Budget:</strong> ${project.amount}
                </div>
                <div className="mb-4">
                  <strong>Progress:</strong>
                  <Progress value={project.progress} className="mt-2" />
                  {userRole === "freelancer" && (
                    <div className="mt-2">
                      <Button onClick={() => handleUpdateProgress(project.id, Math.min(project.progress + 10, 100))}>
                        Update Progress
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <Badge>{project.status}</Badge>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button onClick={() => setSelectedProject(project)}>Send Message</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Send Message</DialogTitle>
                        <DialogDescription>
                          Communicate with your {userRole === "freelancer" ? "client" : "freelancer"}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSendMessage} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="message">Message</Label>
                          <Textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message here"
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={sendingMessage}>
                          {sendingMessage ? "Sending..." : "Send Message"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

