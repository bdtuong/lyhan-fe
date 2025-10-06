"use client"

import React, { useEffect, useState } from "react"

interface LyhanLoadingBarProps {
  duration?: number // tổng thời gian loading (ms)
  onComplete?: () => void
}

export const LyhanLoading: React.FC<LyhanLoadingBarProps> = ({
  duration = 3000,
  onComplete,
}) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const step = 100 // update mỗi 100ms
    const increment = 100 / (duration / step)

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment
        if (next >= 100) {
          clearInterval(interval)
          onComplete?.()
          return 100
        }
        return next
      })
    }, step)

    return () => clearInterval(interval)
  }, [duration, onComplete])

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[9999]">
      {/* Progress bar */}
      <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-white transition-all duration-100 ease-linear rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Text below */}
      <p className="mt-4 text-white text-sm tracking-widest font-semibold uppercase">
        LYHANVERSE
      </p>
    </div>
  )
}
