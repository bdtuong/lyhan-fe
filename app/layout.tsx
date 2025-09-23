import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Suspense } from "react"

// 👇 import MouseEffect
import { MouseEffect } from "@/components/ui/mouse-effect"

// 👇 import AuthProvider
import { AuthProvider } from "@/context/AuthContext"

import { MusicPlayer } from "@/components/music-player"

export const metadata: Metadata = {
  title: "Wings For Lyhan",
  description: "Official fan website celebrating our favorite artist",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} bg-black`}
      >
        <AuthProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <Navigation />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </Suspense>
        </AuthProvider>
        <Analytics />


        
        <MusicPlayer />
        <MouseEffect />
      </body>
    </html>
  )
}
