"use client"

import { motion } from "framer-motion"
import LiquidGlass from "@/components/ui/liquid-glass"
import Image from "next/image"
import Link from "next/link"

export function MusicSection() {
  return (
    <section className="w-full min-h-screen flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 px-4 sm:px-6 lg:px-20 py-16 text-white">
      {/* 📄 TEXT */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.2 }}
        viewport={{ once: true }}
        className="flex-1 flex flex-col justify-center text-center md:text-left space-y-6"
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold">Music.</h1>

        <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-md mx-auto md:mx-0">
          Explore the soundscapes that move your soul. <br />
          Music isn't just sound — it's emotion.
        </p>

        <blockquote className="italic text-white/70 text-sm sm:text-base md:text-lg max-w-md mx-auto md:mx-0">
          “Music is my true devotion — if ever faced between death and music, I would choose music every time.”
        </blockquote>

        <Link href="/music">
          <LiquidGlass className="inline-block px-5 py-2.5 sm:px-6 sm:py-3 rounded-full mt-2 hover:scale-105 transition-transform">
            <span className="text-white font-medium text-sm sm:text-base md:text-lg">
              Listen Now
            </span>
          </LiquidGlass>
        </Link>
      </motion.div>

      {/* 🖼 IMAGES — hidden on mobile */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.2, delay: 0.2 }}
        viewport={{ once: true }}
        className="hidden md:flex flex-1 flex-col sm:flex-row items-center justify-center gap-6"
      >
        {/* Image 1 */}
        <LiquidGlass
          className="w-28 sm:w-36 md:w-44 h-40 sm:h-48 md:h-52 p-2 rounded-xl transition-transform hover:scale-105 glow-animate-1"
          cornerRadius={16}
          blurAmount={0.1}
          displacementScale={20}
          elasticity={0.15}
        >
          <Image
            src="/music-section/ms1.jpg"
            alt="Image 1"
            width={176}
            height={208}
            className="w-full h-full object-cover rounded-md"
          />
        </LiquidGlass>

        {/* Image 2 */}
        <LiquidGlass
          className="w-28 sm:w-36 md:w-44 h-52 sm:h-60 md:h-64 p-2 rounded-xl transition-transform hover:scale-105 glow-animate-2"
          cornerRadius={16}
          blurAmount={0.1}
          displacementScale={20}
          elasticity={0.15}
        >
          <Image
            src="/music-section/ms2.jpg"
            alt="Image 2"
            width={176}
            height={256}
            className="w-full h-full object-cover rounded-md"
          />
        </LiquidGlass>

        {/* Image 3 */}
        <LiquidGlass
          className="w-28 sm:w-36 md:w-44 h-64 sm:h-72 md:h-80 p-2 rounded-xl transition-transform hover:scale-105 glow-animate-3"
          cornerRadius={16}
          blurAmount={0.1}
          displacementScale={20}
          elasticity={0.15}
        >
          <Image
            src="/music-section/ms3.jpg"
            alt="Image 3"
            width={176}
            height={320}
            className="w-full h-full object-cover rounded-md"
          />
        </LiquidGlass>
      </motion.div>
    </section>
  )
}
