"use client"

import Link from "next/link"
import LiquidGlass from "@/components/ui/liquid-glass"
import { motion } from "framer-motion"

export function GallerySection() {
  const imageClass =
    "w-full object-cover rounded-lg shadow-xl relative overflow-hidden max-h-[400px]"

  const images = [
    { src: "/gallery-landing-page/gs1.jpg", alt: "Lyhan performance 1" },
    { src: "/gallery-landing-page/gs2.jpg", alt: "Lyhan performance 2" },
    { src: "/gallery-landing-page/gs3.jpg", alt: "Lyhan performance 3" },
    { src: "/gallery-landing-page/gs4.jpg", alt: "Lyhan performance 4" },
    { src: "/music-section/ms3.jpg", alt: "Lyhan performance 5" },
    { src: "/gallery-landing-page/gs7.jpg", alt: "Lyhan performance 7" },
  ]

  return (
    <section className="py-16 sm:py-20 text-white relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col-reverse lg:flex-row items-center justify-center gap-12 sm:gap-16 lg:gap-24">
        {/* 🖼 Masonry Image Grid — hidden on mobile */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2,
              },
            },
          }}
          viewport={{ once: true }}
          className="hidden md:block w-full lg:w-[60%] columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4"
          aria-hidden="true"
        >
          {images.map((img, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="glow-frame break-inside-avoid"
            >
              <img src={img.src} alt={img.alt} className={imageClass} />
            </motion.div>
          ))}
        </motion.div>

        {/* 📄 Text Block — centered on mobile, right on lg */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="w-full lg:w-[40%] max-w-xl px-2 sm:px-4 py-4 lg:py-8 text-center lg:text-right mx-auto lg:mx-0"
        >
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-4 leading-tight">
            Gallery.
          </h1>
          <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-8">
            Find every image about LYHAN and her magical stage moments.
          </p>

          <Link href="/gallery" className="inline-block">
            <LiquidGlass
              className="inline-block px-5 py-2.5 sm:px-6 sm:py-3 text-center text-white font-medium text-base sm:text-lg rounded-full hover:scale-105 transition-transform"
              blurAmount={0.1}
              displacementScale={20}
              elasticity={0.15}
            >
              View all
            </LiquidGlass>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
