"use client"

import { useEffect, useRef, useState } from "react"
import { motion, PanInfo, useMotionValue, useTransform, type Transition } from "framer-motion"
import type { JSX } from "react"

export interface CarouselItem {
  id: number
  title: string
  description: string
  icon?: React.ReactNode
  image?: string
}

export interface CarouselProps {
  items?: CarouselItem[]
  baseWidth?: number
  autoplay?: boolean
  autoplayDelay?: number
  pauseOnHover?: boolean
  loop?: boolean
  round?: boolean
}

const DRAG_BUFFER = 0
const VELOCITY_THRESHOLD = 500
const GAP = 16
const SPRING_OPTIONS: Transition = { type: "spring", stiffness: 300, damping: 30 }
const RESET_OPTIONS: Transition = { duration: 0 }

export default function Carousel({
  items = [],
  baseWidth = 420,
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = false,
  loop = false,
  round = false
}: CarouselProps): JSX.Element {
  const containerPadding = 16
  const [containerWidth, setContainerWidth] = useState<number>(baseWidth)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
      }
    }
    updateWidth()
    window.addEventListener("resize", updateWidth)
    return () => window.removeEventListener("resize", updateWidth)
  }, [])

  const itemWidth = containerWidth - containerPadding * 2
  const trackItemOffset = itemWidth + GAP

  const enableLoop = loop && items.length > 2
  const canDrag = items.length > 1
  const carouselItems = enableLoop ? [...items, items[0]] : items

  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const x = useMotionValue(0)
  const [isHovered, setIsHovered] = useState<boolean>(false)
  const [isResetting, setIsResetting] = useState<boolean>(false)

  useEffect(() => {
    if (pauseOnHover && containerRef.current) {
      const container = containerRef.current
      const handleMouseEnter = () => setIsHovered(true)
      const handleMouseLeave = () => setIsHovered(false)
      container.addEventListener("mouseenter", handleMouseEnter)
      container.addEventListener("mouseleave", handleMouseLeave)
      return () => {
        container.removeEventListener("mouseenter", handleMouseEnter)
        container.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [pauseOnHover])

  useEffect(() => {
    if (autoplay && canDrag && (!pauseOnHover || !isHovered)) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => {
          if (enableLoop && prev === items.length - 1) return prev + 1
          if (prev === carouselItems.length - 1) return enableLoop ? 0 : prev
          return prev + 1
        })
      }, autoplayDelay)
      return () => clearInterval(timer)
    }
  }, [autoplay, autoplayDelay, isHovered, enableLoop, canDrag, items.length, carouselItems.length, pauseOnHover])

  const effectiveTransition: Transition = isResetting ? RESET_OPTIONS : SPRING_OPTIONS

  const handleAnimationComplete = () => {
    if (enableLoop && currentIndex === carouselItems.length - 1) {
      setIsResetting(true)
      x.set(0)
      setCurrentIndex(0)
      setTimeout(() => setIsResetting(false), 50)
    }
  }

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo): void => {
    const offset = info.offset.x
    const velocity = info.velocity.x
    if (offset < -DRAG_BUFFER || velocity < -VELOCITY_THRESHOLD) {
      if (enableLoop && currentIndex === items.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else {
        setCurrentIndex((prev) => Math.min(prev + 1, carouselItems.length - 1))
      }
    } else if (offset > DRAG_BUFFER || velocity > VELOCITY_THRESHOLD) {
      if (enableLoop && currentIndex === 0) {
        setCurrentIndex(items.length - 1)
      } else {
        setCurrentIndex((prev) => Math.max(prev - 1, 0))
      }
    }
  }

  const dragProps = canDrag
    ? {
        drag: "x" as const,
        dragConstraints: {
          left: -trackItemOffset * (carouselItems.length - 1),
          right: 0
        }
      }
    : {}

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden p-4 rounded-[24px] border border-[#222]"
    >
      <motion.div
        className="flex"
        {...dragProps}
        style={{
          minWidth: itemWidth,
          gap: `${GAP}px`,
          perspective: 1000,
          perspectiveOrigin: `${currentIndex * trackItemOffset + itemWidth / 2}px 50%`,
          x
        }}
        onDragEnd={handleDragEnd}
        animate={{ x: -(currentIndex * trackItemOffset) }}
        transition={effectiveTransition}
        onAnimationComplete={handleAnimationComplete}
      >
        {carouselItems.map((item, index) => {
          if (!item) return null
          const range = [
            -(index + 1) * trackItemOffset,
            -index * trackItemOffset,
            -(index - 1) * trackItemOffset
          ]
          const outputRange = [90, 0, -90]
          const rotateY = useTransform(x, range, outputRange, { clamp: false })

          return (
            <motion.div
              key={index}
              className="relative shrink-0 flex flex-col bg-[#222] border border-[#333] rounded-[12px] overflow-hidden cursor-grab active:cursor-grabbing"
              style={{
                width: itemWidth,
                minHeight: 280,
                rotateY
              }}
              transition={effectiveTransition}
            >
              {item.image && (
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-40 object-cover rounded-t-[12px]"
                  style={{ backfaceVisibility: "visible" }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none"
                  }}
                />
              )}

              <div className="p-5 space-y-2">
                <div className="flex items-center gap-2">
                  {item.icon && (
                    <span className="h-[28px] w-[28px] flex items-center justify-center rounded-full bg-[#060010]">
                      {item.icon}
                    </span>
                  )}
                  <h3 className="font-extrabold text-white text-lg">{item.title}</h3>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{item.description}</p>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Pagination dots */}
      {items.length > 1 && (
        <div className="flex w-full justify-center mt-4">
          <div className="flex justify-center gap-4">
            {items.map((_, index) => (
              <motion.div
                key={index}
                className={`h-2 w-2 rounded-full cursor-pointer transition-colors duration-150 ${
                  currentIndex % items.length === index
                    ? "bg-white"
                    : "bg-[rgba(255,255,255,0.3)]"
                }`}
                animate={{ scale: currentIndex % items.length === index ? 1.2 : 1 }}
                onClick={() => setCurrentIndex(index)}
                transition={{ duration: 0.15 }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
