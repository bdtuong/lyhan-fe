"use client";

import Link from "next/link";
import LiquidGlass from "@/components/ui/liquid-glass";

export function GallerySection() {
  const imageClass =
    "w-56 h-80 object-cover rounded-xl shadow-xl relative overflow-hidden";

  return (
    <section className="py-20 text-white relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 flex flex-col lg:flex-row items-center justify-center gap-48">
        {/* Text */}
        <div className="relative max-w-md px-6 py-8 rounded-xl">
          <h2 className="text-3xl font-serif font-bold text-white mb-4">
            Cùng nhìn lại <span className="gradient-text">LYHAN</span> sau mỗi hành trình
          </h2>
          <p className="text-gray-300 text-base leading-relaxed mb-8">
            Mỗi sân khấu mà LYHAN đặt chân, mỗi lần giọng ca cất lên đều hóa thành
            những khoảnh khắc lấp lánh, đáng để ghi dấu trong tim. Bộ sưu tập này lưu giữ
            không chỉ hình ảnh, mà còn cả những cảm xúc thăng hoa trên từng chặng đường
            nghệ thuật của LYHAN.
          </p>

          {/* CTA button */}
          <Link href="/gallery" className="relative z-10 inline-block w-48">
            <LiquidGlass
              className="text-center py-3 text-lg font-semibold cursor-pointer hover:scale-105 transition-transform"
              cornerRadius={16}
              blurAmount={0.15}
              displacementScale={35}
              elasticity={0.2}
            >
              Đi thoi →
            </LiquidGlass>
          </Link>
        </div>

        {/* Images */}
        <div className="relative flex items-center justify-center gap-10">
          {/* Cột trái lệch xuống */}
          <div className="flex flex-col gap-10 mt-36">
            <div className="glow-frame">
              <img
                src="/gallery-landing-page/lh-g-1.jpg"
                alt="Lyhan performance 1"
                className={imageClass}
              />
            </div>
            <div className="glow-frame">
              <img
                src="/gallery-landing-page/lh-g-2.jpg"
                alt="Lyhan performance 2"
                className={imageClass}
              />
            </div>
          </div>

          {/* Cột phải */}
          <div className="flex flex-col gap-10">
            <div className="glow-frame">
              <img
                src="/gallery-landing-page/lh-g-3.jpg"
                alt="Lyhan performance 3"
                className={imageClass}
              />
            </div>
            <div className="glow-frame">
              <img
                src="/gallery-landing-page/lh-g-4.jpg"
                alt="Lyhan performance 4"
                className={imageClass}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
