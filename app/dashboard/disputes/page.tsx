"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useSupabase } from "@/components/providers/supabase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Dispute {
  id: string
  project_id: string
  initiator_id: string
  reason: string
  evidence: string
  status: string
  created_at: string
  projects: {
    jobs: {
      title: string
    }
  }
  profiles: {
    full_name: string
  }
}

export default function Disputes() {
  const { supabase, user, userRole } = useSupabase()
  const { toast } = useToast()
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null)
  const [resolution, setResolution] = useState("")
  const [resolvingDispute, setResolvingDispute] = useState(false)

  useEffect(() => {
    fetchDisputes()
  }, [])

  const fetchDisputes = async () => {
    try {
      let query = supabase
        .from("disputes")
        .select(`
          *,
          projects (
            jobs (
              title
            )
          ),
          profiles (
            full_name
          )
        `)
        .order("created_at", { ascending: false })

      if (userRole !== "admin") {
        query = query.or(
          `initiator_id.eq.${user?.id},projects.employer_id.eq.${user?.id},projects.freelancer_id.eq.${user?.id}`,
        )
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      setDisputes(data || [])
    } catch (error: any) {
      toast({
        title: "Error fetching disputes",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResolveDispute = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedDispute || !resolution) {
      toast({
        title: "Missing resolution",
        description: "Please provide a resolution for the dispute.",
        variant: "destructive",
      })
      return
    }

    try {
      setResolvingDispute(true)

      const { error } = await supabase
        .from("disputes")
        .update({
          status: "resolved",
          resolution: resolution,
        })
        .eq("id", selectedDispute.id)

      if (error) {
        throw error
      }

      toast({
        title: "Dispute resolved",
        description: "The dispute has been successfully resolved.",
      })

      setResolution("")
      setSelectedDispute(null)
      fetchDisputes()
    } catch (error: any) {
      toast({
        title: "Error resolving dispute",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setResolvingDispute(false)
    }
  }

  if (loading) {
    return <div>Loading disputes...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Disputes</h1>

      {disputes.length === 0 ? (
        <p>No disputes found.</p>
      ) : (
        <div className="space-y-4">
          {disputes.map((dispute) => (
            <Card key={dispute.id}>
              <CardHeader>
                <CardTitle>{dispute.projects.jobs.title}</CardTitle>
                <CardDescription>
                  Initiated by: {dispute.profiles.full_name} | Date: {new Date(dispute.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>
                    <strong>Reason:</strong> {dispute.reason}
                  </p>
                  <p>
                    <strong>Evidence:</strong> {dispute.evidence}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge>{dispute.status}</Badge>
                    {userRole === "admin" && dispute.status === "pending" && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button onClick={() => setSelectedDispute(dispute)}>Resolve Dispute</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Resolve Dispute</DialogTitle>
                            <DialogDescription>Provide a resolution for this dispute</DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleResolveDispute} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="resolution">Resolution</Label>
                              <Textarea
                                id="resolution"
                                value={resolution}
                                onChange={(e) => setResolution(e.target.value)}
                                placeholder="Explain how this dispute is being resolved"
                                required
                              />
                            </div>
                            <Button type="submit" className="w-full" disabled={resolvingDispute}>
                              {resolvingDispute ? "Resolving..." : "Resolve Dispute"}
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

