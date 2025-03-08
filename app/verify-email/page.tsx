"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle, XCircle } from "lucide-react"

export default function VerifyEmail() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  const [verifying, setVerifying] = useState(true)
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setVerifying(false)
        return
      }

      try {
        // In a real implementation, you would verify the token with your backend
        // For now, we'll simulate a successful verification
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "email",
        })

        if (error) throw error

        setVerified(true)

        toast({
          title: "Email verified",
          description: "Your email has been successfully verified. You can now log in.",
        })
      } catch (error: any) {
        toast({
          title: "Verification failed",
          description: error.message,
          variant: "destructive",
        })
      } finally {
        setVerifying(false)
      }
    }

    verifyEmail()
  }, [token, toast, supabase.auth])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Email Verification</CardTitle>
          <CardDescription className="text-center">
            {verifying ? "Verifying your email..." : verified ? "Your email has been verified!" : "Verification failed"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          {verifying ? (
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          ) : verified ? (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <p className="mb-4 text-center">
                Thank you for verifying your email. You can now access all features of WORKWISE AI.
              </p>
              <Button onClick={() => router.push("/login")}>Go to Login</Button>
            </>
          ) : (
            <>
              <XCircle className="h-16 w-16 text-red-500 mb-4" />
              <p className="mb-4 text-center">
                We couldn't verify your email. The verification link may have expired or is invalid.
              </p>
              <Button onClick={() => router.push("/login")}>Go to Login</Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

