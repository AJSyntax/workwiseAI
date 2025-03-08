"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/components/providers/supabase-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MultiSelect } from "@/components/ui/multi-select"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const skillOptions = [
  { label: "Web Development", value: "web_development" },
  { label: "Mobile Development", value: "mobile_development" },
  { label: "UI/UX Design", value: "ui_ux_design" },
  { label: "Graphic Design", value: "graphic_design" },
  { label: "Content Writing", value: "content_writing" },
  { label: "Digital Marketing", value: "digital_marketing" },
  { label: "SEO", value: "seo" },
  { label: "Data Analysis", value: "data_analysis" },
  { label: "Video Editing", value: "video_editing" },
  { label: "Translation", value: "translation" },
]

export default function PostJob() {
  const router = useRouter()
  const { supabase, user } = useSupabase()
  const { toast } = useToast()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [requiredSkills, setRequiredSkills] = useState<string[]>([])
  const [budget, setBudget] = useState("")
  const [deadline, setDeadline] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !description || requiredSkills.length === 0 || !budget || !deadline) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      const { data, error } = await supabase.from("jobs").insert({
        employer_id: user?.id,
        title,
        description,
        required_skills: requiredSkills,
        budget: Number.parseFloat(budget),
        deadline,
        status: "open",
      })

      if (error) {
        throw error
      }

      toast({
        title: "Job posted successfully",
        description: "Your job has been posted and is now visible to freelancers.",
      })

      router.push("/dashboard/employer/jobs")
    } catch (error: any) {
      toast({
        title: "Error posting job",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Post a New Job</h1>

      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
          <CardDescription>Provide information about the job you want to post</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Web Developer for E-commerce Site"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Job Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a detailed description of the job requirements and expectations"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="required-skills">Required Skills</Label>
              <MultiSelect
                options={skillOptions}
                selected={requiredSkills}
                onChange={setRequiredSkills}
                placeholder="Select required skills"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget ($)</Label>
              <Input
                id="budget"
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. 1000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Posting Job..." : "Post Job"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

