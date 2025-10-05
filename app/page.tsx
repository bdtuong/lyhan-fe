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
      <div className="min-h-screen flex items-center justify-center bg-black-900">
        <LyhanLoading size="lg" color="blue" />
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return (
    <div className="min-h-screen w-full bg-black-950 relative">
      {/* Background glow */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, 
              rgba(241, 241, 241, 0.12) 0%,    /* ~black-50 */
              rgba(219, 219, 219, 0.07) 25%,   /* ~black-100 */
              rgba(186, 186, 186, 0.04) 35%,   /* ~black-200 */
              transparent 50%
            )
          `,
          backgroundSize: "100% 100%",
        }}
      />

      <div className="relative z-10 space-y-0 text-black-50">
        <HeroSection />
        <SocialSection />
        <MusicSection />
        <GallerySection />
        <EventsSection />
      </div>
    </div>
  )
}
