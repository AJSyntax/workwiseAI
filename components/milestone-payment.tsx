"use client"

import { useState } from "react"
import { useSupabase } from "@/components/providers/supabase-provider"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface MilestonePaymentProps {
  projectId: string
  employerId: string
  freelancerId: string
  userRole: string
}

interface Milestone {
  id: string
  description: string
  amount: number
  status: string
}

export function MilestonePayment({ projectId, employerId, freelancerId, userRole }: MilestonePaymentProps) {
  const { supabase, user } = useSupabase()
  const { toast } = useToast()
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(false)
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [creatingMilestone, setCreatingMilestone] = useState(false)

  const fetchMilestones = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("milestones")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true })

      if (error) throw error

      setMilestones(data || [])
    } catch (error: any) {
      toast({
        title: "Error fetching milestones",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createMilestone = async () => {
    if (!description || !amount) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setCreatingMilestone(true)
    try {
      const { data, error } = await supabase.from("milestones").insert({
        project_id: projectId,
        description,
        amount: Number.parseFloat(amount),
        status: "pending",
      })

      if (error) throw error

      toast({
        title: "Milestone created",
        description: "The milestone has been created successfully.",
      })

      setDescription("")
      setAmount("")
      fetchMilestones()
    } catch (error: any) {
      toast({
        title: "Error creating milestone",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setCreatingMilestone(false)
    }
  }

  const updateMilestoneStatus = async (milestoneId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("milestones").update({ status: newStatus }).eq("id", milestoneId)

      if (error) throw error

      toast({
        title: "Milestone updated",
        description: `The milestone has been ${newStatus}.`,
      })

      fetchMilestones()
    } catch (error: any) {
      toast({
        title: "Error updating milestone",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Milestones</h3>
        {userRole === "freelancer" && (
          <Dialog>
            <DialogTrigger asChild>
              <Button>Request Milestone</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Milestone Payment</DialogTitle>
                <DialogDescription>Create a milestone payment request for this project.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what this milestone covers"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 500"
                    required
                  />
                </div>
                <Button onClick={createMilestone} className="w-full" disabled={creatingMilestone}>
                  {creatingMilestone ? "Requesting..." : "Request Milestone"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
        <div>Loading milestones...</div>
      ) : milestones.length === 0 ? (
        <p>No milestones found for this project.</p>
      ) : (
        <div className="space-y-4">
          {milestones.map((milestone) => (
            <Card key={milestone.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{milestone.description}</CardTitle>
                  <Badge>{milestone.status}</Badge>
                </div>
                <CardDescription>${milestone.amount.toFixed(2)}</CardDescription>
              </CardHeader>
              <CardContent>
                {userRole === "employer" && milestone.status === "pending" && (
                  <div className="flex gap-2">
                    <Button onClick={() => updateMilestoneStatus(milestone.id, "approved")} variant="default">
                      Approve
                    </Button>
                    <Button onClick={() => updateMilestoneStatus(milestone.id, "rejected")} variant="destructive">
                      Reject
                    </Button>
                  </div>
                )}
                {userRole === "freelancer" && milestone.status === "approved" && (
                  <Button onClick={() => updateMilestoneStatus(milestone.id, "completed")} variant="default">
                    Mark as Completed
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

