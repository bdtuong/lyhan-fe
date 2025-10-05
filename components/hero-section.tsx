"use client"

import LightRays from "@/components/ui/light-rays"
import ShinyText from "@/components/ui/shiny-text"
import Link from "next/link"
import LiquidGlass from "@/components/ui/liquid-glass"

export function HeroSection() {
  return (
    <section className="relative h-screen min-h-[80vh] w-full flex flex-col items-center justify-center px-4 sm:px-6 text-center overflow-hidden">
      {/* 🔆 LightRays background */}
      <div className="absolute inset-0 z-0">
        <LightRays
          raysOrigin="top-center"
          raysColor="#ffffff"
          raysSpeed={1.2}
          lightSpread={0.9}
          rayLength={1.3}
          fadeDistance={0.9}
          saturation={0.9}
          className="w-full h-full"
        />
      </div>

      {/* 📄 Content */}
      <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight flex flex-col items-center gap-4">
          <ShinyText
            text="LYHANVERSE"
            speed={4}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold"
          />
          <span className="italic text-sm sm:text-base md:text-lg lg:text-xl text-[var(--black-50)] opacity-80">
            “ A small haven for LYHAN fans. ”
          </span>
        </h1>

        {/* CTA buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <Link href="/socials">
            <LiquidGlass className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-full">
              <span className="text-white font-medium text-sm sm:text-base">
                Get Started
              </span>
            </LiquidGlass>
          </Link>

          <button
            onClick={() => {
              const target = document.getElementById("next-section")
              target?.scrollIntoView({ behavior: "smooth" })
            }}
          >
            <LiquidGlass className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-full" overLight>
              <span className="text-white font-medium text-sm sm:text-base">
                Learn More
              </span>
            </LiquidGlass>
          </button>
        </div>
      </div>
    </section>
  )
}
