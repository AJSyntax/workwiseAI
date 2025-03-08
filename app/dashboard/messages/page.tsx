'use client'

import { useState, useEffect } from "react"
import { useSupabase } from "@/components/providers/supabase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Message {
  id: string
  content: string
  created_at: string
  sender_id: string
  project_id: string
  sender: {
    full_name: string
    avatar_url?: string
  }
}

interface Project {
  id: string
  job_id: string
  job: {
    title: string
  }
}

export default function MessagesPage() {
  const { supabase, user } = useSupabase()
  const { toast } = useToast()
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")

  useEffect(() => {
    if (!user) return
    fetchProjects()
  }, [user])

  useEffect(() => {
    if (!selectedProject) return
    fetchMessages()
    const cleanup = subscribeToMessages()
    return cleanup
  }, [selectedProject])

  const fetchProjects = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("projects")
        .select(`
          id,
          job_id,
          jobs (
            title
          )
        `)
        .or(`freelancer_id.eq.${user.id},employer_id.eq.${user.id}`)
        .returns<{
          id: string
          job_id: string
          jobs: { title: string }
        }[]>()

      if (error) throw error

      const formattedProjects: Project[] = data.map(item => ({
        id: item.id,
        job_id: item.job_id,
        job: {
          title: item.jobs.title
        }
      }))

      setProjects(formattedProjects)
      if (formattedProjects.length > 0) {
        setSelectedProject(formattedProjects[0])
      }
    } catch (error: any) {
      toast({
        title: "Error fetching projects",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const fetchMessages = async () => {
    if (!selectedProject) return

    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*, sender:profiles(full_name, avatar_url)")
        .eq("project_id", selectedProject.id)
        .order("created_at", { ascending: true })

      if (error) throw error

      setMessages(data as Message[])
    } catch (error: any) {
      toast({
        title: "Error fetching messages",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const subscribeToMessages = () => {
    if (!selectedProject) return () => {}

    const channel = supabase
      .channel(`project_${selectedProject.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `project_id=eq.${selectedProject.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedProject || !user) return

    try {
      const { error } = await supabase.from("messages").insert({
        content: newMessage,
        project_id: selectedProject.id,
        sender_id: user.id,
      })

      if (error) throw error

      setNewMessage("")
    } catch (error: any) {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <p className="text-center">Please sign in to view messages</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Projects</CardTitle>
              <CardDescription>Select a project to view messages</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {projects.map((project) => (
                  <Button
                    key={project.id}
                    variant={selectedProject?.id === project.id ? "default" : "ghost"}
                    className="w-full justify-start mb-2"
                    onClick={() => setSelectedProject(project)}
                  >
                    {project.job.title}
                  </Button>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>{selectedProject ? selectedProject.job.title : "Select a Project"}</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] mb-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start gap-2 ${
                        message.sender_id === user.id ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.sender.avatar_url} />
                        <AvatarFallback>{message.sender.full_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div
                        className={`rounded-lg p-3 ${
                          message.sender_id === user.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm font-medium mb-1">{message.sender.full_name}</p>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex gap-2">
                <Textarea
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                />
                <Button onClick={sendMessage}>Send</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
