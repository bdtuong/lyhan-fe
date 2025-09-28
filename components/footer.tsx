"use client"

import { ChevronUp, Facebook, Instagram, Youtube } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="relative bg-gradient-to-b from-blue-950/80 to-black border-t border-white/10">
      <div className="container mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10 text-gray-300">
        {/* Logo + desc */}
        <div className="space-y-3">
          <h2 className="text-3xl font-extrabold tracking-wide bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 bg-clip-text text-transparent">
            Lyhan
          </h2>
          <p className="text-sm leading-relaxed text-gray-400">
            Official fan project.
          </p>
        </div>

        {/* Quick links */}
        <div className="space-y-3">
          <h3 className="text-white font-semibold uppercase tracking-wide text-sm">
            Liên kết nhanh
          </h3>
          <nav className="flex flex-col space-y-2">
            <Link href="/music" className="hover:text-cyan-400 transition-colors">Music</Link>
            <Link href="/gallery" className="hover:text-cyan-400 transition-colors">Gallery</Link>
            <Link href="/events" className="hover:text-cyan-400 transition-colors">Events</Link>
            <Link href="/about" className="hover:text-cyan-400 transition-colors">About</Link>
          </nav>
        </div>

        {/* Socials */}
        <div className="flex flex-col items-start md:items-end justify-between space-y-6">
          <div className="flex space-x-4">
            {[
              { href: "https://www.facebook.com/profile.php?id=100075664732643", icon: Facebook },
              { href: "https://www.instagram.com/__lyhan__/", icon: Instagram },
              { href: "https://www.youtube.com/channel/UCWBhNrnr35nhNYS3PJBRP4Q", icon: Youtube },
            ].map(({ href, icon: Icon }, i) => (
              <Link
                key={i}
                href={href}
                target="_blank"
                className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-cyan-500/20 hover:text-cyan-400 transition-colors shadow-sm"
              >
                <Icon className="w-5 h-5" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom line */}
      <div className="border-t border-white/10 text-center py-5 text-xs text-gray-500">
        © {new Date().getFullYear()} Lyhan Fan Project. All rights reserved.
      </div>

      {/* Floating Back to Top button */}
      <Button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 rounded-full p-3 bg-cyan-600 text-white shadow-lg hover:bg-cyan-500 transition-all"
      >
        <ChevronUp className="w-5 h-5" />
      </Button>
    </footer>
  )
}
