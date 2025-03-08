"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export function EnvSetupGuide() {
  return (
    <div className="max-w-3xl mx-auto p-4">
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <CardTitle className="text-green-700">Environment Variables Configured</CardTitle>
          </div>
          <CardDescription className="text-green-600">
            Your application environment variables are set up correctly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              Your Supabase environment variables have been configured successfully. You can now use all the features of
              your application.
            </p>

            <div className="bg-white p-4 rounded border border-gray-200 font-mono text-sm">
              <pre>
                {`# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://hzaoxrubaprshvidnzig.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=***************

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000`}
              </pre>
            </div>

            <p>
              If you need to update these variables in the future, edit your <code>.env.local</code> file.
            </p>

            <div className="flex justify-end">
              <Button onClick={() => window.location.reload()} className="bg-green-600 hover:bg-green-700">
                Reload Page
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

