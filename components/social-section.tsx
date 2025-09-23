"use client";

import {
  MessageCircle,
  Users,
  Music,
  Star,
  Share2,
} from "lucide-react";
import Link from "next/link";
import LiquidGlass from "@/components/ui/liquid-glass";

export function SocialSection() {
  return (
    <section className="h-screen flex items-center text-white relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 flex flex-col lg:flex-row items-center justify-center gap-28">
        {/* Left - Image */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <div className="glow-frame hover:scale-105 transition-transform duration-500">
            <img
              src="/lh-ss.jpg"
              alt="Lyhan Social"
              className="w-[520px] h-auto rounded-2xl shadow-2xl object-cover"
            />
          </div>
        </div>

        {/* Right - Text */}
        <div className="w-full lg:w-1/2 max-w-lg relative">
          <h2 className="text-3xl font-serif font-bold text-white mb-6 relative z-10">
            Mạng xã hội mini dành cho{" "}
            <span className="gradient-text">Lyhan Fan</span>
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed mb-6 relative z-10">
            Đây là không gian riêng tư, nơi những người hâm mộ Lyhan có thể kết
            nối, sẻ chia và lưu giữ những khoảnh khắc đặc biệt. Tại đây, bạn
            không chỉ theo dõi những cập nhật mới nhất mà còn cùng nhau tạo nên
            những kỷ niệm đong đầy cảm xúc.
          </p>
          <p className="text-gray-400 text-base leading-relaxed mb-8 relative z-10">
            Hãy cùng tham gia và viết nên câu chuyện cộng đồng – nơi mọi trái tim
            đồng điệu vì tình yêu dành cho âm nhạc và con người Lyhan.
          </p>

          {/* CTA button */}
          <Link href="/socials" className="relative z-10 inline-block w-48">
            <LiquidGlass
              className="text-center py-3 text-lg font-semibold cursor-pointer hover:scale-105 transition-transform"
              cornerRadius={16}
              blurAmount={0.15}
              displacementScale={35}
              elasticity={0.2}
            >
              Đến ngay →
            </LiquidGlass>
          </Link>

          {/* Floating icons */}
          <MessageCircle className="floating-icon text-blue-400 w-10 h-10 absolute -top-12 right-0" />
          <Users className="floating-icon text-cyan-400 w-12 h-12 absolute top-1/2 -right-16" />
          <Music className="floating-icon text-blue-300 w-10 h-10 absolute top-0 -left-12" />
          <Star className="floating-icon text-blue-200 w-8 h-8 absolute bottom-6 -left-12" />
          <Share2 className="floating-icon text-cyan-300 w-9 h-9 absolute bottom-0 -right-10" />
        </div>
      </div>

      {/* Custom styles */}
      <style jsx global>{`
        .floating-icon {
          animation: float 5s ease-in-out infinite;
        }
        .floating-icon:nth-child(1) {
          animation-delay: 0s;
        }
        .floating-icon:nth-child(2) {
          animation-delay: 1s;
        }
        .floating-icon:nth-child(3) {
          animation-delay: 2s;
        }
        .floating-icon:nth-child(4) {
          animation-delay: 1.5s;
        }
        .floating-icon:nth-child(5) {
          animation-delay: 2.5s;
        }
        .floating-icon:nth-child(6) {
          animation-delay: 3s;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-12px) rotate(5deg);
          }
        }
      `}</style>
    </section>
  );
}
