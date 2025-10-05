"use client"

import { useEffect, useState } from "react"
import { getPosts } from "@/services/post.services"
import TextType from "./ui/text-type"
import LiquidGlass from "@/components/ui/liquid-glass"
import Link from "next/link"
import { Heart, MessageCircle, Share2 } from "lucide-react"

type Post = {
  _id: string
  title?: string
  content?: string
  images?: string[]
  username?: string
  createdAt?: string
  [k: string]: any
}

export function SocialSection() {
  const [latestPosts, setLatestPosts] = useState<Post[]>([])

  useEffect(() => {
    getPosts(1, 3, { includePending: false })
      .then((data) => {
        const arr: Post[] = (data?.boards || []).slice(0, 3)
        setLatestPosts(arr)
      })
      .catch((err) => console.error("❌ fetch latest posts:", err))
  }, [])

  return (
    <section id="next-section" className="relative overflow-hidden text-white py-10 sm:py-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* 🔤 Title */}
        <div className="text-center mb-6 sm:mb-8">
          <TextType
            as="h2"
            className="text-xl sm:text-2xl lg:text-3xl font-semibold leading-snug"
            text={[
              "Welcome to LYHANVERSE !",
              "Fan posts have never looked so good",
              "Latest updates from your community",
              "Discover what fans are sharing"
            ]}
            typingSpeed={60}
            deletingSpeed={30}
            pauseDuration={2000}
            cursorCharacter="▋"
            textColors={["#ffffff"]}
            variableSpeed={{ min: 40, max: 90 }}
            startOnVisible
          />
          <p className="text-gray-400 text-sm mt-1">
            Just check out the latest updates!
          </p>
        </div>

        {/* 🖥 Desktop Grid */}
        <div className="hidden sm:grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {latestPosts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>

        {/* 📱 Mobile Carousel */}
        <div
          className="
            flex sm:hidden gap-4 overflow-x-auto snap-x snap-mandatory
            scrollbar-hide scroll-smooth px-1 -mx-1
          "
        >
          {latestPosts.map((post) => (
            <div key={post._id} className="snap-center shrink-0 w-[85%]">
              <PostCard post={post} />
            </div>
          ))}
        </div>

        {/* 📌 CTA Button */}
        <div className="mt-10 flex justify-center">
          <Link href="/socials">
            <LiquidGlass className="inline-block px-5 py-2.5 sm:px-6 sm:py-3 rounded-full hover:scale-105 transition-transform">
              <span className="text-white font-medium text-sm sm:text-base md:text-lg">
                Join us
              </span>
            </LiquidGlass>
          </Link>
        </div>
      </div>
    </section>
  )
}

// Format createdAt date
function formatCreatedAt(isoDate?: string) {
  if (!isoDate) return ""
  const date = new Date(isoDate)
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

// 🎴 Post Card Component
function PostCard({ post }: { post: Post }) {
  return (
    <div
      className="
        bg-white/5 backdrop-blur-md border border-white/10
        rounded-lg shadow-sm shadow-black/20
        overflow-hidden transition-all duration-300
        hover:scale-[1.015] hover:border-white/20 hover:shadow-white/10
      "
    >
      {post.video?.url ? (
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          <video
            src={post.video.url}
            className="h-full w-full object-cover"
            muted
            playsInline
            preload="metadata"
          />
        </div>
      ) : post.images?.[0] ? (
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          <img
            src={post.images[0]}
            alt={post.title || "post"}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
      ) : null}


      <div className="p-2.5 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-gray-400">
          <span className="font-medium text-white/90">{post.username}</span>
          <span>{formatCreatedAt(post.createdAt)}</span>
        </div>

        <p className="text-white/90 text-xs sm:text-sm line-clamp-2">
          {post.content}
        </p>

        <div className="flex gap-2 text-gray-400 text-xs pt-1">
          <button className="hover:text-pink-400 transition-colors">
            <Heart size={14} />
          </button>
          <button className="hover:text-blue-400 transition-colors">
            <MessageCircle size={14} />
          </button>
          <button className="hover:text-green-400 transition-colors">
            <Share2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
