"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useSupabase } from "@/components/providers/supabase-provider"
import { EnvSetupGuide } from "@/components/env-setup-guide"

export default function Home() {
  const { error } = useSupabase()

  // If there's a Supabase initialization error, show the setup guide
  if (error) {
    return <EnvSetupGuide />
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">WORKWISE AI</h1>
          <div className="flex gap-4">
            <Button asChild variant="outline">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Register</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">AI-Powered Freelance Marketplace</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              WORKWISE AI connects skilled freelancers with exciting projects using advanced AI matching. Find the
              perfect talent or project with ease.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/register?type=employer">Hire Talent</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/register?type=freelancer">Find Work</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">How WORKWISE AI Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 border rounded-lg shadow-sm">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Create Your Profile</h3>
                <p>Sign up and let our AI analyze your skills and preferences.</p>
              </div>
              <div className="text-center p-6 border rounded-lg shadow-sm">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Get Matched</h3>
                <p>Our AI algorithm matches you with the best jobs or talent.</p>
              </div>
              <div className="text-center p-6 border rounded-lg shadow-sm">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Collaborate & Succeed</h3>
                <p>Work together efficiently with our integrated tools and support.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} WORKWISE AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

