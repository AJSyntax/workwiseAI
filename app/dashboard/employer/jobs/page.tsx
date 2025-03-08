"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/components/providers/supabase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface Job {
  id: string
  title: string
  description: string
  required_skills: string[]
  budget: number
  deadline: string
  status: string
}

interface Bid {
  id: string
  freelancer_id: string
  price: number
  proposal: string
  status: string
  created_at: string
  profiles: {
    full_name: string
  }
}

export default function EmployerJobs() {
  const { supabase, user } = useSupabase()
  const { toast } = useToast()
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [bids, setBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("employer_id", user?.id)
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setJobs(data || [])
    } catch (error: any) {
      toast({
        title: "Error fetching jobs",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchBids = async (jobId: string) => {
    try {
      const { data, error } = await supabase
        .from("bids")
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .eq("job_id", jobId)
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setBids(data || [])
    } catch (error: any) {
      toast({
        title: "Error fetching bids",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleAcceptBid = async (bidId: string, jobId: string) => {
    try {
      // Update bid status
      const { error: bidError } = await supabase.from("bids").update({ status: "accepted" }).eq("id", bidId)

      if (bidError) {
        throw bidError
      }

      // Update job status
      const { error: jobError } = await supabase.from("jobs").update({ status: "in_progress" }).eq("id", jobId)

      if (jobError) {
        throw jobError
      }

      // Create a new project
      const { data: bidData } = await supabase.from("bids").select("*").eq("id", bidId).single()

      if (bidData) {
        const { error: projectError } = await supabase.from("projects").insert({
          job_id: jobId,
          employer_id: user?.id,
          freelancer_id: bidData.freelancer_id,
          amount: bidData.price,
          status: "in_progress",
        })

        if (projectError) {
          throw projectError
        }
      }

      toast({
        title: "Bid accepted",
        description: "The project has been created and the freelancer has been notified.",
      })

      // Refresh jobs and bids
      fetchJobs()
      fetchBids(jobId)
    } catch (error: any) {
      toast({
        title: "Error accepting bid",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div>Loading your jobs...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Jobs</h1>

      {jobs.length === 0 ? (
        <p>You haven't posted any jobs yet.</p>
      ) : (
        <div className="grid gap-6">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <CardTitle>{job.title}</CardTitle>
                <CardDescription>
                  Budget: ${job.budget} | Deadline: {new Date(job.deadline).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{job.description}</p>
                <div className="mb-4">
                  <strong>Required Skills:</strong>
                  <ul className="list-disc list-inside">
                    {job.required_skills.map((skill, index) => (
                      <li key={index}>{skill}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center justify-between">
                  <Badge>{job.status}</Badge>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => {
                          setSelectedJob(job)
                          fetchBids(job.id)
                        }}
                      >
                        View Bids
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Bids for {job.title}</DialogTitle>
                        <DialogDescription>Review and accept bids from freelancers</DialogDescription>
                      </DialogHeader>
                      {bids.length === 0 ? (
                        <p>No bids received yet.</p>
                      ) : (
                        <div className="space-y-4">
                          {bids.map((bid) => (
                            <Card key={bid.id}>
                              <CardHeader>
                                <CardTitle>{bid.profiles.full_name}</CardTitle>
                                <CardDescription>Bid Amount: ${bid.price}</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <p className="mb-4">{bid.proposal}</p>
                                <div className="flex items-center justify-between">
                                  <Badge>{bid.status}</Badge>
                                  {bid.status === "pending" && job.status === "open" && (
                                    <Button onClick={() => handleAcceptBid(bid.id, job.id)}>Accept Bid</Button>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
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

