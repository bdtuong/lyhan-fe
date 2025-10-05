"use client"

import { useEffect, useState } from "react"
import { getEvents } from "@/services/event.services"
import { type Event } from "@/hooks/useEvents"
import Carousel, { type CarouselItem } from "@/components/ui/carousel"
import { Calendar } from "lucide-react"
import Link from "next/link"
import LiquidGlass from "@/components/ui/liquid-glass"

export function EventsSection() {
  const [items, setItems] = useState<CarouselItem[]>([])

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await getEvents()
        const events = (res.events || [])
          .filter((e) => e.createdAt)
          .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
          .slice(0, 3)

        const mapped: CarouselItem[] = events.map((event, i) => {
          const start = new Date(event.startTime)
          const end = new Date(event.endTime)
          const image = event.images?.[0] || ""

          return {
            id: i,
            title: event.title,
            description: [
              start.toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
              }),
              `${start.toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit"
              })} - ${end.toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit"
              })}`,
              event.location
            ]
              .filter(Boolean)
              .join(" • "),
            icon: <Calendar className="w-4 h-4 text-white" />,
            image
          }
        })

        setItems(mapped)
      } catch (error) {
        console.error("❌ Failed to fetch events:", error)
      }
    }

    fetchEvents()
  }, [])

  return (
    <section className="w-full px-4 sm:px-6 max-w-7xl mx-auto py-16 sm:py-20 min-h-[70vh] flex flex-col items-center justify-center text-white text-center">
      {/* Title */}
      <h2 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight mb-4">
        Events
      </h2>

      {/* Subtitle */}
      <p className="text-gray-400 text-sm sm:text-base mb-12 sm:mb-14 max-w-md sm:max-w-xl">
        Stay updated with the latest events from your favorite artist and fans.
      </p>

      {/* Carousel */}
      {items.length === 0 ? (
        <p className="text-gray-500">No upcoming events available.</p>
      ) : (
        <div className="w-full max-w-[90vw] sm:max-w-2xl lg:max-w-4xl">
          <Carousel items={items} autoplay loop pauseOnHover baseWidth={420} />
        </div>
      )}

      {/* CTA Button */}
      <div className="mt-10 sm:mt-12">
        <Link href="/events" className="inline-block">
          <LiquidGlass
            className="inline-block px-5 py-2.5 sm:px-6 sm:py-3 text-center text-white font-medium text-base sm:text-lg rounded-full hover:scale-105 transition-transform"
            blurAmount={0.1}
            displacementScale={20}
            elasticity={0.15}
          >
            See all events
          </LiquidGlass>
        </Link>
      </div>
    </section>
  )
}
