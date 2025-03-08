"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useSupabase } from "@/components/providers/supabase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MultiSelect } from "@/components/ui/multi-select"

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

interface Profile {
  id: string
  full_name: string
  skills: string[]
  hourly_rate: number | null
  portfolio_url: string | null
  company_name: string | null
  bio: string | null
}

export default function Settings() {
  const { supabase, user, userRole } = useSupabase()
  const { toast } = useToast()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user?.id).single()

      if (error) {
        throw error
      }

      setProfile(data)
    } catch (error: any) {
      toast({
        title: "Error fetching profile",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!profile) return

    try {
      setUpdating(true)

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          skills: profile.skills,
          hourly_rate: profile.hourly_rate,
          portfolio_url: profile.portfolio_url,
          company_name: profile.company_name,
          bio: profile.bio,
        })
        .eq("id", user?.id)

      if (error) {
        throw error
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return <div>Loading profile...</div>
  }

  if (!profile) {
    return <div>Error: Profile not found</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Update your personal information and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input
                id="full-name"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                required
              />
            </div>

            {userRole === "freelancer" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="skills">Skills</Label>
                  <MultiSelect
                    options={skillOptions}
                    selected={profile.skills}
                    onChange={(selected) => setProfile({ ...profile, skills: selected })}
                    placeholder="Select your skills"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hourly-rate">Hourly Rate ($)</Label>
                  <Input
                    id="hourly-rate"
                    type="number"
                    value={profile.hourly_rate || ""}
                    onChange={(e) => setProfile({ ...profile, hourly_rate: Number.parseFloat(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portfolio-url">Portfolio URL</Label>
                  <Input
                    id="portfolio-url"
                    type="url"
                    value={profile.portfolio_url || ""}
                    onChange={(e) => setProfile({ ...profile, portfolio_url: e.target.value })}
                  />
                </div>
              </>
            )}

            {userRole === "employer" && (
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  value={profile.company_name || ""}
                  onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profile.bio || ""}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Tell us about yourself"
              />
            </div>

            <Button type="submit" className="w-full" disabled={updating}>
              {updating ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

