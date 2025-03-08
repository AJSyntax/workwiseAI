"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/components/providers/supabase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function FindTalent() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [freelancers, setFreelancers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchFreelancers()
  }, [])

  const fetchFreelancers = async () => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("role", "freelancer")

      if (error) throw error

      setFreelancers(data)
    } catch (error) {
      toast({
        title: "Error fetching freelancers",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const filteredFreelancers = freelancers.filter(
    (freelancer) =>
      freelancer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      freelancer.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Find Talent</h1>

      <div className="mb-6">
        <Label htmlFor="search">Search by name or skill</Label>
        <Input
          id="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="e.g. John Doe or Web Development"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFreelancers.map((freelancer) => (
          <Card key={freelancer.id}>
            <CardHeader>
              <CardTitle>{freelancer.full_name}</CardTitle>
              <CardDescription>{freelancer.skills.join(", ")}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{freelancer.bio}</p>
              <p className="mb-4">Hourly Rate: ${freelancer.hourly_rate}/hr</p>
              <Button>Contact Freelancer</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

