"use client"

import Link from "next/link"
import LiquidGlass from "@/components/ui/liquid-glass"
import { Music } from "lucide-react"
import { motion } from "framer-motion"

const songs = [
  { title: "Rơi tự do", thumbnail: "/thumbs/rtd.jpg", href: "/music/song1" },
  { title: "Nhân danh tình yêu", thumbnail: "/thumbs/ndty.jpg", href: "/music/song2" },
  { title: "WELCOME HOME", thumbnail: "/thumbs/wh.jpg", href: "/music/song3" },
]

export function MusicSection() {
  return (
    <section
      id="next-section"
      className="min-h-screen flex flex-col md:flex-row items-center justify-center gap-12 overflow-hidden py-12 px-4"
    >
      {/* Ảnh với ambient glow */}
      <motion.div
        initial={{ rotateX: -90, opacity: 0 }}
        whileInView={{ rotateX: 0, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.3 }}
        className="relative w-full md:w-1/2 flex justify-center [transform-origin:top]"
      >
        {/* Ambient glow background */}
        <div className="absolute inset-0 flex items-center justify-center z-0">
          <div className="w-[350px] h-[350px] md:w-[500px] md:h-[500px] rounded-full bg-gradient-radial from-blue-500/30 to-transparent blur-3xl" />
        </div>

        {/* Image */}
        <img
          src="/lh-1.png"
          alt="Music"
          className="relative z-10 max-h-[60vh] md:max-h-[80vh] w-auto object-contain rounded-2xl shadow-lg"
        />
      </motion.div>

      {/* Box lớn + Box nhỏ */}
      <motion.div
        initial={{ x: 200, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.3 }}
        className="w-full md:w-1/2 flex flex-col items-center gap-6"
      >
        {/* Box lớn (giữ Link) */}
        <Link href="/music" className="w-full md:w-4/5">
          <LiquidGlass
            className="p-6 md:p-8 text-left cursor-pointer flex flex-col items-start"
            cornerRadius={24}
            blurAmount={0.15}
            displacementScale={40}
            elasticity={0.2}
          >
            <div className="flex items-center gap-4 mb-4 md:mb-6">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-700 rounded-full flex items-center justify-center">
                <Music className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="text-2xl md:text-3xl font-semibold group-hover:text-primary transition-colors">
                Nghe nhạc cùng Lyhan
              </h3>
            </div>
            <p className="text-white/80 text-base md:text-lg leading-relaxed">
              Bước vào thế giới âm nhạc của Lyhan, nơi giai điệu dịu dàng và sâu lắng khẽ
              ngân – không chỉ để nghe, mà để chạm đến trái tim.
            </p>
          </LiquidGlass>
        </Link>

        {/* Các box nhỏ — ẨN trên mobile, hiện từ md trở lên (đÃ BỎ LINK) */}
        <div className="hidden md:grid w-full md:w-4/5 grid-cols-1 gap-4">
          {songs.map((song) => (
            <div key={song.title}>
              <LiquidGlass
                className="group relative p-4 flex items-center justify-center h-full"
                cornerRadius={16}
                blurAmount={0.1}
                displacementScale={25}
                elasticity={0.15}
              >
                {/* Thumbnail + title ngang nhau, ở giữa */}
                <div className="flex items-center gap-4">
                  <img
                    src={song.thumbnail}
                    alt={song.title}
                    className="w-12 h-12 md:w-14 md:h-14 rounded-md object-cover"
                  />
                  <span className="text-base md:text-lg font-medium">
                    {song.title}
                  </span>
                </div>
              </LiquidGlass>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
