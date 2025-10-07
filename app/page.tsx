"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { HeroSection } from "@/components/hero-section"
import { MusicSection } from "@/components/music-section"
import { GallerySection } from "@/components/gallery-section"
import { SocialSection } from "@/components/social-section"
import { EventsSection } from "@/components/events-section"
import LoginPage from "../app/auth/login/page"
import { LyhanLoading } from "@/components/ui/loading"

export default function HomePage() {
  const { user, loading: authLoading } = useAuth()
  const [showLoader, setShowLoader] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // 💡 Loading 2.5s để hiệu ứng đẹp
  useEffect(() => {
    if (!authLoading) {
      const timer = setTimeout(() => setShowLoader(false), 2500)
      return () => clearTimeout(timer)
    }
  }, [authLoading])

  // ✅ Auto-redirect nếu vừa đăng nhập và vào homepage lần đầu
  useEffect(() => {
    const hasRedirected = localStorage.getItem("hasRedirected")
    if (user && !authLoading && pathname === "/" && !hasRedirected) {
      localStorage.setItem("hasRedirected", "true")
      router.push("/socials")
    }
  }, [user, authLoading, pathname, router])

  // 🌀 Đang loading auth hoặc loader effect
  if (authLoading || showLoader) {
    return <LyhanLoading duration={1500} />
  }

  // 🔐 Nếu chưa login → hiển thị homepage
  if (!user) {
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

        {/* Main content */}
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

  // ✅ Nếu đã login và đã redirect → cho ở lại homepage nếu họ quay lại
  return (
    <div className="min-h-screen w-full bg-black-950 relative">
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
