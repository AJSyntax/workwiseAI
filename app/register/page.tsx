"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import type { Database } from "@/types/supabase"
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

export default function Register() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("type") || "freelancer"
  const { toast } = useToast()
  const supabase = createClientComponentClient<Database>()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)

  // Freelancer specific fields
  const [skills, setSkills] = useState<string[]>([])
  const [hourlyRate, setHourlyRate] = useState("")
  const [portfolioUrl, setPortfolioUrl] = useState("")

  // Employer specific fields
  const [companyName, setCompanyName] = useState("")
  const [requiredSkills, setRequiredSkills] = useState<string[]>([])

  const handleRegister = async (role: string) => {
    if (!email || !password || !fullName) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      // Register user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
          data: {
            full_name: fullName,
            role: role,
          },
        },
      })

      if (error) {
        throw error
      }

      if (data?.user) {
        // Create profile based on role
        if (role === "freelancer") {
          await supabase.from("profiles").insert({
            id: data.user.id,
            full_name: fullName,
            role: "freelancer",
            skills: skills,
            hourly_rate: hourlyRate ? Number.parseFloat(hourlyRate) : null,
            portfolio_url: portfolioUrl || null,
          })
        } else if (role === "employer") {
          await supabase.from("profiles").insert({
            id: data.user.id,
            full_name: fullName,
            role: "employer",
            company_name: companyName || null,
            skills: requiredSkills,
          })
        }

        // Check if email confirmation is required
        if (data.session) {
          // User is signed in immediately (email confirmation not required)
          toast({
            title: "Registration successful!",
            description: "You are now signed in.",
          })
          router.push("/dashboard")
        } else {
          // Email confirmation is required
          toast({
            title: "Registration successful!",
            description:
              "Please check your email to verify your account. If you don't receive an email, you can still log in with your credentials.",
          })
          router.push("/login")
        }
      }
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">Create an Account</h1>
          <p className="mt-2 text-gray-600">Join our freelance marketplace</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="freelancer">Freelancer</TabsTrigger>
              <TabsTrigger value="employer">Employer</TabsTrigger>
            </TabsList>

            {/* Freelancer Registration Form */}
            <TabsContent value="freelancer">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="freelancer-name">Full Name</Label>
                  <Input
                    id="freelancer-name"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="freelancer-email">Email</Label>
                  <Input
                    id="freelancer-email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="freelancer-password">Password</Label>
                  <Input
                    id="freelancer-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="freelancer-skills">Skills</Label>
                  <MultiSelect
                    options={skillOptions}
                    selected={skills}
                    onChange={setSkills}
                    placeholder="Select your skills"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hourly-rate">Hourly Rate ($)</Label>
                  <Input
                    id="hourly-rate"
                    type="number"
                    placeholder="25"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portfolio-url">Portfolio URL (Optional)</Label>
                  <Input
                    id="portfolio-url"
                    placeholder="https://yourportfolio.com"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                  />
                </div>

                <Button className="w-full" onClick={() => handleRegister("freelancer")} disabled={loading}>
                  {loading ? "Creating Account..." : "Create Freelancer Account"}
                </Button>
              </div>
            </TabsContent>

            {/* Employer Registration Form */}
            <TabsContent value="employer">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="employer-name">Full Name</Label>
                  <Input
                    id="employer-name"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employer-email">Email</Label>
                  <Input
                    id="employer-email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employer-password">Password</Label>
                  <Input
                    id="employer-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name (Optional)</Label>
                  <Input
                    id="company-name"
                    placeholder="Acme Inc."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="required-skills">Skills You Frequently Need</Label>
                  <MultiSelect
                    options={skillOptions}
                    selected={requiredSkills}
                    onChange={setRequiredSkills}
                    placeholder="Select required skills"
                  />
                </div>

                <Button className="w-full" onClick={() => handleRegister("employer")} disabled={loading}>
                  {loading ? "Creating Account..." : "Create Employer Account"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

