import type React from "react"
import type { Metadata } from "next"
import { Be_Vietnam_Pro } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Suspense } from "react"
import { MouseEffect } from "@/components/ui/mouse-effect"
import { AuthProvider } from "@/context/AuthContext"
import { MusicPlayer } from "@/components/music-player"

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"], variable: "--font-sans",
  weight: "100"
})

export const metadata: Metadata = {
  title: "Lyhan Mini Social Media",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={`font-sans ${beVietnam.variable} bg-black`}>
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
