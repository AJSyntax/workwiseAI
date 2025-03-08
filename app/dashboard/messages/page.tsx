"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useSupabase } from "@/components/providers/supabase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: string
  project_id: string
  sender_id: string
  content: string
  created_at: string
  profiles: {
    full_name: string
  }
}

interface Project {
  id: string
  job_id: string
  jobs: {
    title: string
  }
}

export default function Messages() {
  const { supabase, user } = useSupabase()
  const { toast } = useToast()
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    if (selectedProject) {
      fetchMessages(selectedProject.id)
      const subscription = supabase
        .channel(`project_${selectedProject.id}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages", filter: `project_id=eq.${selectedProject.id}` },
          (payload) => {
            setMessages((currentMessages) => [...currentMessages, payload.new as Message])
          },
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [selectedProject])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchProjects = async () => {
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
        .or(`employer_id.eq.${user?.id},freelancer_id.eq.${user?.id}`)
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setProjects(data || [])
      if (data && data.length > 0) {
        setSelectedProject(data[0])
      }
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

  const fetchMessages = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .eq("project_id", projectId)
        .order("created_at", { ascending: true })

      if (error) {
        throw error
      }

      setMessages(data || [])
    } catch (error: any) {
      toast({
        title: "Error fetching messages",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedProject || !newMessage) {
      return
    }

    try {
      setSendingMessage(true)

      const { data, error } = await supabase.from("messages").insert({
        project_id: selectedProject.id,
        sender_id: user?.id,
        content: newMessage,
      })

      if (error) {
        throw error
      }

      setNewMessage("")
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

  if (loading) {
    return <div>Loading messages...</div>
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="w-1/4 border-r p-4">
        <h2 className="text-xl font-bold mb-4">Projects</h2>
        <div className="space-y-2">
          {projects.map((project) => (
            <Button
              key={project.id}
              className="w-full justify-start"
              variant={selectedProject?.id === project.id ? "default" : "outline"}
              onClick={() => setSelectedProject(project)}
            >
              {project.jobs.title}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        {selectedProject ? (
          <>
            <CardHeader>
              <CardTitle>{selectedProject.jobs.title}</CardTitle>
              <CardDescription>Messages for this project</CardDescription>
            </CardHeader>
            <ScrollArea className="flex-1 p-4">
              {messages.map((message) => (
                <Card key={message.id} className="mb-4">
                  <CardHeader>
                    <CardTitle className="text-sm">{message.profiles.full_name}</CardTitle>
                    <CardDescription>{new Date(message.created_at).toLocaleString()}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>{message.content}</p>
                  </CardContent>
                </Card>
              ))}
              <div ref={messagesEndRef} />
            </ScrollArea>
            <div className="p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message here"
                  className="flex-1"
                />
                <Button type="submit" disabled={sendingMessage}>
                  {sendingMessage ? "Sending..." : "Send"}
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>Select a project to view messages</p>
          </div>
        )}
      </div>
    </div>
  )
}

