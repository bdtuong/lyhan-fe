"use client"

import Atropos from "atropos/react"
import "atropos/css"
import { useMemo } from "react"
import { ChevronDown } from "lucide-react"

function BubbleLayer({ zIndex }: { zIndex: number }) {
  const bubbleColors = ["#9ee8ff", "#66d1ff", "#2b82d9"]

  const bubbles = useMemo(
    () =>
      Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        size: 15 + Math.random() * 35,
        duration: 25 + Math.random() * 15,
        delay: Math.random() * 10,
        startLeft: Math.random() * 20,
        color: bubbleColors[Math.floor(Math.random() * bubbleColors.length)],
      })),
    []
  )

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ zIndex }}
    >
      {bubbles.map((b) => (
        <span
          key={b.id}
          className="bubble absolute bottom-[20px] rounded-full"
          style={{
            left: `${b.startLeft}%`,
            width: `${b.size}px`,
            height: `${b.size}px`,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
            background: `radial-gradient(circle at 30% 30%, ${b.color}, rgba(255,255,255,0.05))`,
          }}
        />
      ))}
    </div>
  )
}

export function HeroSection() {
  const handleScroll = () => {
    const nextSection = document.getElementById("next-section")
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section className="relative h-screen w-full flex items-center justify-center px-6 overflow-hidden">
      {/* Bubble layer BEHIND */}
      <BubbleLayer zIndex={0} />

      <Atropos
        className="relative z-10 w-full max-w-5xl h-[65vh] overflow-hidden rounded-[28px] atropos-custom"
        rotateXMax={15}
        rotateYMax={15}
        shadow
        highlight
        activeOffset={40}
        shadowScale={1.2}
      >
        {/* Background layer */}
        <div className="absolute inset-0" data-atropos-offset="0">
          <img
            src="/hero-bg.png"
            alt="Background"
            className="w-full h-full object-cover scale-150 rounded-[32px]"
          />
          <div className="absolute inset-0 rounded-[32px] pointer-events-none" />
        </div>

        {/* Foreground */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          data-atropos-offset="5"
        >
          <img
            src="/lyhan.png"
            alt="Lyhan"
            className="w-full h-full object-contain scale-110 drop-shadow-2xl pointer-events-none"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-8 py-16">
          <div data-atropos-offset="12" className="flex justify-center">
            <img
              src="/lyhan-wordmark.png"
              alt="Lyhan Wordmark"
              className="max-h-[200px] md:max-h-[280px] object-contain"
            />
          </div>
        </div>
      </Atropos>

      {/* Bubble layer FRONT */}
      <BubbleLayer zIndex={20} />

      {/* Scroll down button */}
      <button
        onClick={handleScroll}
        className="absolute bottom-6 z-30 flex flex-col items-center animate-bounce text-white/80 hover:text-white transition-colors"
      >
        <ChevronDown className="w-10 h-10" strokeWidth={2.5} />
        <span className="text-sm font-medium mt-1">Xuống dưới</span>
      </button>

      <style jsx global>{`
        @keyframes floatBubble {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 0.9;
          }
          20% {
            transform: translate(10vw, -35vh) scale(1.05);
          }
          35% {
            transform: translate(25vw, -10vh) scale(1);
          }
          50% {
            transform: translate(40vw, -65vh) scale(0.95);
          }
          65% {
            transform: translate(55vw, -20vh) scale(0.95);
          }
          80% {
            transform: translate(70vw, -85vh) scale(0.9);
          }
          100% {
            transform: translate(85vw, -130vh) scale(0.9);
            opacity: 0;
          }
        }

        .bubble {
          animation-name: floatBubble;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          border-radius: 50%;
          filter: blur(0.5px);
        }

        .atropos-custom {
          --atropos-shadow: 50px;
          --atropos-shadow-color: rgba(30, 64, 175, 0.6); /* xanh dương mờ */
          transition: --atropos-shadow-color 0.3s ease;
        }
        .atropos-custom:hover {
          --atropos-shadow-color: rgba(30, 64, 175, 0.9); /* đậm hơn khi hover */
        }
      `}</style>
    </section>
  )
}
