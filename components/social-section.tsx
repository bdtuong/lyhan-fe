"use client"

import Link from "next/link"
import {
  MessageCircle,
  Users,
  Music,
  Star,
  Share2,
  type LucideIcon,
} from "lucide-react"
import LiquidGlass from "@/components/ui/liquid-glass"
import { memo } from "react"

/* ---------- Floating Icon: delay theo prop ---------- */
const FloatingIcon = memo(function FloatingIcon({
  Icon,
  className,
  delay = 0,
  title,
}: {
  Icon: LucideIcon
  className?: string
  delay?: number
  title?: string
}) {
  return (
    <Icon
      className={`pointer-events-none float-anim motion-reduce:!animate-none ${className || ""}`}
      style={{ animationDelay: `${delay}s` }}
      aria-hidden={!title}
    />
  )
})

export function SocialSection() {
  return (
    <section
      className="
        relative overflow-hidden text-white
        py-12 sm:py-16 md:py-20
        min-h-[75svh] md:min-h-screen
        flex items-center justify-center
      "
    >
      <div className="w-full max-w-3xl text-center relative px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold mb-4 sm:mb-6 leading-tight">
          Mạng xã hội mini dành cho <span className="gradient-text">Lyhan Fan</span>
        </h2>

        <p className="text-gray-300 text-sm sm:text-base lg:text-lg leading-relaxed mb-4 sm:mb-6">
          Đây là không gian riêng tư, nơi những người hâm mộ Lyhan có thể kết
          nối, sẻ chia và lưu giữ những khoảnh khắc đặc biệt. Tại đây, bạn
          không chỉ theo dõi những cập nhật mới nhất mà còn cùng nhau tạo nên
          những kỷ niệm đong đầy cảm xúc.
        </p>

        <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-6 sm:mb-8">
          Hãy cùng tham gia và viết nên câu chuyện cộng đồng – nơi mọi trái tim
          đồng điệu vì tình yêu dành cho âm nhạc và con người Lyhan.
        </p>

        {/* CTA button */}
        <Link href="/socials" className="inline-block w-[11rem] sm:w-48">
          <LiquidGlass
            className="
              text-center py-2.5 sm:py-3 text-base sm:text-lg font-semibold
              cursor-pointer transition-transform
              hover:scale-[1.03] active:scale-[0.99]
              motion-reduce:transition-none motion-reduce:hover:scale-100
            "
            cornerRadius={14}
            blurAmount={0.12}
            displacementScale={28}
            elasticity={0.18}
          >
            Đến ngay →
          </LiquidGlass>
        </Link>

        {/* Floating icons */}
        <FloatingIcon
          Icon={MessageCircle}
          className="text-blue-400 w-9 h-9 sm:w-10 sm:h-10 absolute -top-10 sm:-top-12 right-8 opacity-90"
          delay={0}
          title="Tin nhắn"
        />
        <FloatingIcon
          Icon={Users}
          className="text-cyan-400 w-10 h-10 sm:w-12 sm:h-12 absolute top-1/2 -right-12 sm:-right-20 opacity-90"
          delay={1}
          title="Cộng đồng"
        />
        <FloatingIcon
          Icon={Music}
          className="hidden sm:block text-blue-300 w-9 h-9 absolute -top-4 -left-10 opacity-90"
          delay={2}
          title="Âm nhạc"
        />
        <FloatingIcon
          Icon={Star}
          className="hidden md:block text-blue-200 w-7 h-7 absolute bottom-8 -left-10 opacity-90"
          delay={1.5}
          title="Yêu thích"
        />
        <FloatingIcon
          Icon={Share2}
          className="hidden sm:block text-cyan-300 w-8 h-8 absolute bottom-0 -right-8 opacity-90"
          delay={2.5}
          title="Chia sẻ"
        />
      </div>

      {/* Styles: animation */}
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) rotate(0);
          }
          50% {
            transform: translateY(-12px) rotate(5deg);
          }
        }
        .float-anim {
          animation: float 5s ease-in-out infinite;
          will-change: transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .float-anim {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  )
}
