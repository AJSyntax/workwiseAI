"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useSupabase } from "@/components/providers/supabase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Job {
  id: string
  title: string
  description: string
  required_skills: string[]
  budget: number
  deadline: string
}

export default function AvailableJobs() {
  const { supabase, user } = useSupabase()
  const { toast } = useToast()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [bidAmount, setBidAmount] = useState("")
  const [bidProposal, setBidProposal] = useState("")
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [bidding, setBidding] = useState(false)

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("status", "open")
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

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedJob || !bidAmount || !bidProposal) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      setBidding(true)

      const { data, error } = await supabase.from("bids").insert({
        job_id: selectedJob.id,
        freelancer_id: user?.id,
        price: Number.parseFloat(bidAmount),
        proposal: bidProposal,
        status: "pending",
      })

      if (error) {
        throw error
      }

      toast({
        title: "Bid submitted successfully",
        description: "Your bid has been sent to the employer for review.",
      })

      setBidAmount("")
      setBidProposal("")
      setSelectedJob(null)
    } catch (error: any) {
      toast({
        title: "Error submitting bid",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setBidding(false)
    }
  }

  if (loading) {
    return <div>Loading available jobs...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Available Jobs</h1>

      {jobs.length === 0 ? (
        <p>No available jobs found.</p>
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
                <Dialog>
                  <DialogTrigger asChild>
                    <Button onClick={() => setSelectedJob(job)}>Place Bid</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Place a Bid</DialogTitle>
                      <DialogDescription>Submit your proposal and bid amount for this job</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleBidSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="bid-amount">Bid Amount ($)</Label>
                        <Input
                          id="bid-amount"
                          type="number"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          placeholder="e.g. 500"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bid-proposal">Proposal</Label>
                        <Textarea
                          id="bid-proposal"
                          value={bidProposal}
                          onChange={(e) => setBidProposal(e.target.value)}
                          placeholder="Explain why you're the best fit for this job"
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={bidding}>
                        {bidding ? "Submitting Bid..." : "Submit Bid"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

