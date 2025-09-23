"use client"

import { ChevronUp, Facebook, Instagram, Youtube } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="bg-gradient-to-b from-slate-900 to-black border-t border-slate-800">
      <div className="container mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-400">
        {/* Logo + desc */}
        <div>
          <h2 className="text-2xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Lyhan
          </h2>
          <p className="mt-2 text-sm">
            Official fan project — crafted with ❤️ by Tường & cộng đồng.
          </p>
        </div>

        {/* Quick links */}
        <div className="flex flex-col space-y-2">
          <h3 className="text-white font-semibold mb-2">Liên kết</h3>
          <Link href="/music" className="hover:text-cyan-400 transition">
            Music
          </Link>
          <Link href="/gallery" className="hover:text-cyan-400 transition">
            Gallery
          </Link>
          <Link href="/events" className="hover:text-cyan-400 transition">
            Events
          </Link>
          <Link href="/about" className="hover:text-cyan-400 transition">
            About
          </Link>
        </div>

        {/* Social + back to top */}
        <div className="flex flex-col items-start md:items-end space-y-4">
          <div className="flex space-x-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/10 hover:bg-cyan-500/20 transition"
            >
              <Facebook className="w-5 h-5 text-white" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/10 hover:bg-cyan-500/20 transition"
            >
              <Instagram className="w-5 h-5 text-white" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/10 hover:bg-cyan-500/20 transition"
            >
              <Youtube className="w-5 h-5 text-white" />
            </a>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={scrollToTop}
            className="flex items-center space-x-2 bg-cyan-600 text-white border-0 hover:bg-cyan-500 transition-colors"
          >
            <ChevronUp className="w-4 h-4" />
            <span>Back to Top</span>
          </Button>
        </div>
      </div>

      {/* Bottom line */}
      <div className="border-t border-slate-800 text-center py-4 text-sm text-gray-500">
        © {new Date().getFullYear()} Lyhan Fan Project. All rights reserved.
      </div>
    </footer>
  )
}
