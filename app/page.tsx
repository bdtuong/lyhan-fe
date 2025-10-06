"use client"

import { HeroSection } from "@/components/hero-section"
import { MusicSection } from "@/components/music-section"
import { GallerySection } from "@/components/gallery-section"
import { SocialSection } from "@/components/social-section"
import LoginPage from "../app/auth/login/page"
import { useAuth } from "@/context/AuthContext"
import { LyhanLoading } from "@/components/ui/loading"
import { EventsSection } from "@/components/events-section"
import { useState, useEffect } from "react"

export default function HomePage() {
  const { user, loading: authLoading } = useAuth()
  const [showLoader, setShowLoader] = useState(true)

  // Giữ loading tối thiểu 2.5s để thanh chạy hoàn chỉnh
  useEffect(() => {
    if (!authLoading) {
      const delay = setTimeout(() => {
        setShowLoader(false)
      }, 2500)
      return () => clearTimeout(delay)
    }
  }, [authLoading])

  // Nếu vẫn đang auth loading hoặc chưa timeout đủ 2.5s → show loading
  if (authLoading || showLoader) {
    return <LyhanLoading duration={2500} />
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
              rgba(241, 241, 241, 0.12) 0%,    
              rgba(219, 219, 219, 0.07) 25%,   
              rgba(186, 186, 186, 0.04) 35%,   
              transparent 50%
            )
          `,
          backgroundSize: "100% 100%",
        }}
      />

      {/* Nội dung chính */}
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
