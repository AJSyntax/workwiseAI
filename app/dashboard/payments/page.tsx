"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useSupabase } from "@/components/providers/supabase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Payment {
  id: string
  project_id: string
  amount: number
  status: string
  created_at: string
  projects: {
    jobs: {
      title: string
    }
  }
}

export default function Payments() {
  const { supabase, user, userRole } = useSupabase()
  const { toast } = useToast()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [withdrawing, setWithdrawing] = useState(false)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      let query = supabase
        .from("payments")
        .select(`
          *,
          projects (
            jobs (
              title
            )
          )
        `)
        .order("created_at", { ascending: false })

      if (userRole === "freelancer") {
        query = query.eq("recipient_id", user?.id)
      } else if (userRole === "employer") {
        query = query.eq("sender_id", user?.id)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      setPayments(data || [])
    } catch (error: any) {
      toast({
        title: "Error fetching payments",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!withdrawAmount) {
      toast({
        title: "Missing amount",
        description: "Please enter an amount to withdraw.",
        variant: "destructive",
      })
      return
    }

    try {
      setWithdrawing(true)

      // In a real application, you would integrate with a payment gateway here
      // For this example, we'll just simulate a successful withdrawal

      toast({
        title: "Withdrawal successful",
        description: `$${withdrawAmount} has been sent to your account.`,
      })

      setWithdrawAmount("")
    } catch (error: any) {
      toast({
        title: "Error processing withdrawal",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setWithdrawing(false)
    }
  }

  if (loading) {
    return <div>Loading payments...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Payments</h1>

      {userRole === "freelancer" && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Withdraw Funds</CardTitle>
            <CardDescription>Transfer your earnings to your bank account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="withdraw-amount">Amount to withdraw ($)</Label>
                <Input
                  id="withdraw-amount"
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="e.g. 100"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={withdrawing}>
                {withdrawing ? "Processing..." : "Withdraw"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {payments.length === 0 ? (
        <p>No payment history found.</p>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <Card key={payment.id}>
              <CardHeader>
                <CardTitle>{payment.projects.jobs.title}</CardTitle>
                <CardDescription>Date: {new Date(payment.created_at).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold">Amount: ${payment.amount}</p>
                    <Badge>{payment.status}</Badge>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">View Details</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Payment Details</DialogTitle>
                        <DialogDescription>Information about this payment</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-2">
                        <p>
                          <strong>Project:</strong> {payment.projects.jobs.title}
                        </p>
                        <p>
                          <strong>Amount:</strong> ${payment.amount}
                        </p>
                        <p>
                          <strong>Status:</strong> {payment.status}
                        </p>
                        <p>
                          <strong>Date:</strong> {new Date(payment.created_at).toLocaleString()}
                        </p>
                      </div>
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

