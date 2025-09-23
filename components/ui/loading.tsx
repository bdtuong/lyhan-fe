"use client"

import React, { useEffect, useState } from "react"

interface LyhanLoadingProps {
  size?: "sm" | "md" | "lg"
  color?: "blue" | "gray" | "green" | "red" | "purple" | "black"
  speed?: "slow" | "normal" | "fast"
  showCursor?: boolean
  onComplete?: () => void
  className?: string
}

export const LyhanLoading: React.FC<LyhanLoadingProps> = ({
  size = "md",
  color = "blue",
  speed = "normal",
  showCursor = true,
  onComplete,
  className = "",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  const word = "Lyhan"

  const sizeClasses = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-6xl",
  }

  const colorClasses = {
    blue: "text-blue-600",
    gray: "text-gray-600",
    green: "text-green-600",
    red: "text-red-600",
    purple: "text-purple-600",
    black: "text-gray-900",
  }

  const speedTiming = {
    slow: 800,
    normal: 500,
    fast: 300,
  }

  const cursorColorClasses = {
    blue: "border-blue-600",
    gray: "border-gray-600",
    green: "border-green-600",
    red: "border-red-600",
    purple: "border-purple-600",
    black: "border-gray-900",
  }

  useEffect(() => {
    if (currentIndex < word.length) {
      const timer = setTimeout(() => {
        setCurrentIndex((prev) => prev + 1)
      }, speedTiming[speed])
      return () => clearTimeout(timer)
    } else {
      setTimeout(() => {
        setIsComplete(true)
        onComplete?.()
      }, 500)
    }
  }, [currentIndex, word.length, speed, speedTiming, onComplete])

  const visibleText = word.slice(0, currentIndex)

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative">
        <div
          className={`
            ${sizeClasses[size]} 
            ${colorClasses[color]} 
            font-bold 
            tracking-wide
            relative
            select-none
            flex items-center
          `}
          style={{
            fontFamily: "cursive",
            textShadow: "0 1px 2px rgba(0,0,0,0.1)",
          }}
        >
          {/* Hiệu ứng chữ viết */}
          {visibleText.split("").map((letter, index) => (
            <span
              key={index}
              className="inline-block animate-bounce"
              style={{
                animationDelay: `${index * 0.1}s`,
                animationDuration: "0.6s",
                animationFillMode: "both",
              }}
            >
              {letter}
            </span>
          ))}

          {/* Thêm trái tim xanh 💙 sau khi hoàn tất */}
          {isComplete && (
            <span className="ml-2 animate-pulse text-blue-500">💙</span>
          )}

          {/* Con trỏ gõ chữ */}
          {showCursor && !isComplete && (
            <span
              className={`
                inline-block 
                w-0.5 
                ${size === "sm" ? "h-8" : size === "md" ? "h-12" : "h-16"}
                ${cursorColorClasses[color]}
                border-r-2
                animate-pulse
                ml-1
              `}
            />
          )}
        </div>
      </div>
    </div>
  )
}
