"use client"

import { HeroSection } from "@/components/hero-section"
import { MusicSection } from "@/components/music-section"
import { GallerySection } from "@/components/gallery-section"
import { SocialSection } from "@/components/social-section"
import LoginPage from "../app/auth/login/page"
import { useAuth } from "@/context/AuthContext"
import { LyhanLoading } from "@/components/ui/loading"
import { EventsSection } from "@/components/events-section"

export default function HomePage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <LyhanLoading size="lg" color="blue" />
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 relative">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, 
              rgba(203, 213, 225, 0.12) 0%, 
              rgba(203, 213, 225, 0.07) 25%, 
              rgba(203, 213, 225, 0.03) 35%, 
              transparent 50%
            )
          `,
          backgroundSize: "100% 100%",
        }}
      />

      <div className="relative z-10 space-y-0">
        <HeroSection />
        <SocialSection />
        <MusicSection />
        <GallerySection />
        
        <EventsSection />
      </div>
    </div>
  )
}
