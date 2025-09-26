"use client"

import { useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react"

export interface LightboxImage {
  id: string | number
  src: string
  alt: string
  content: string // đổi từ title sang content
  category: string[] // nhiều hashtag
}

interface LightboxProps {
  image: LightboxImage
  images: LightboxImage[]
  onClose: () => void
  onNext: (image: LightboxImage) => void
  onPrevious: (image: LightboxImage) => void
}

export function Lightbox({ image, images, onClose, onNext, onPrevious }: LightboxProps) {
  const currentIndex = images.findIndex((img) => img.id === image.id)
  const isFirst = currentIndex === 0
  const isLast = currentIndex === images.length - 1

  const handleNext = () => {
    if (!isLast) {
      onNext(images[currentIndex + 1])
    }
  }

  const handlePrevious = () => {
    if (!isFirst) {
      onPrevious(images[currentIndex - 1])
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose()
          break
        case "ArrowRight":
          handleNext()
          break
        case "ArrowLeft":
          handlePrevious()
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "unset"
    }
  }, [currentIndex, images.length])

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Download Button */}
      <a
        href={image.src}
        download={`gallery-image-${image.id}.jpg`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="absolute top-4 right-16 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition"
        title="Tải ảnh về"
      >
        <Download className="w-5 h-5" />
      </a>

      {/* Navigation Buttons */}
      {!isFirst && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
        >
          <ChevronLeft className="w-8 h-8" />
        </Button>
      )}
      {!isLast && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
        >
          <ChevronRight className="w-8 h-8" />
        </Button>
      )}

      {/* Image Container */}
      <div className="relative max-w-4xl max-h-[80vh] w-full h-full flex items-center justify-center">
        <Image
          src={image.src || "/placeholder.svg"}
          alt={image.alt}
          width={800}
          height={600}
          className="max-w-full max-h-full object-contain"
          priority
        />

        {/* Image Info */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 max-h-[40%] overflow-y-auto">
          <h2 className="text-white text-xl font-semibold mb-2 break-words whitespace-pre-line leading-relaxed w-full">
            {image.content}
          </h2>
          <p className="text-white/80 text-sm break-words whitespace-pre-line leading-snug w-full">
            {image.category && image.category.length > 0 ? image.category.join(" ") : ""}
          </p>
          <p className="text-white/60 text-xs mt-2">
            {currentIndex + 1} of {images.length}
          </p>
        </div>
      </div>

      {/* Click outside to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  )
}
