import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { SupabaseProvider } from "@/components/providers/supabase-provider"
import { Analytics } from '@vercel/analytics/react'
import { ExtensionGuard } from "@/components/providers/extension-guard"
import { ErrorBoundary } from "@/components/error-boundary"

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true
})

export const metadata: Metadata = {
  title: "WORKWISE AI - Freelance Marketplace",
  description: "Connect employers with freelancers using AI-powered matching",
  generator: 'v0.dev',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <ExtensionGuard>
            <SupabaseProvider>
              {children}
              <Toaster />
            </SupabaseProvider>
            <Analytics />
          </ExtensionGuard>
        </ErrorBoundary>
      </body>
    </html>
  )
}