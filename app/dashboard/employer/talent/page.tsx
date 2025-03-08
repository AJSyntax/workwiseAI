'use client'

import { useState, useEffect } from "react"
import { useSupabase } from "@/components/providers/supabase-provider"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Freelancer {
  id: string
  full_name: string
  email: string
  avatar_url?: string
  skills: string[]
  hourly_rate: number
  role: string
  bio: string
}

export default function FindTalent() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [freelancers, setFreelancers] = useState<Freelancer[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchFreelancers()
  }, [])

  const fetchFreelancers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "freelancer")

      if (error) throw error

      setFreelancers(data as Freelancer[])
    } catch (error: any) {
      toast({
        title: "Error fetching freelancers",
        description: error?.message || "Failed to fetch freelancers",
        variant: "destructive",
      })
    }
  }

  const filteredFreelancers = freelancers.filter((freelancer) =>
    freelancer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    freelancer.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Find Talent</h1>
        <div className="w-full md:w-1/3">
          <Label htmlFor="search">Search by name or skill</Label>
          <Input
            id="search"
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFreelancers.map((freelancer) => (
          <Card key={freelancer.id}>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={freelancer.avatar_url} alt={freelancer.full_name} />
                <AvatarFallback>{freelancer.full_name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{freelancer.full_name}</CardTitle>
                <p className="text-sm text-gray-500">${freelancer.hourly_rate}/hr</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {freelancer.skills?.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              <p className="mb-4">{freelancer.bio}</p>
              <Button asChild className="w-full">
                <Link href={`/dashboard/employer/talent/${freelancer.id}`}>View Profile</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
