"use client"

import { ChevronUp, Facebook, Instagram, Youtube } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="bg-blue-950/40 backdrop-blur-xl border-t border-blue-200/10 shadow-lg">
      <div className="container mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-200">
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
            <Link
              href="https://facebook.com"
              target="_blank"
              className="text-gray-300 hover:text-cyan-400"
            >
              <Facebook className="w-5 h-5" />
            </Link>
            <Link
              href="https://instagram.com"
              target="_blank"
              className="text-gray-300 hover:text-cyan-400"
            >
              <Instagram className="w-5 h-5" />
            </Link>
            <Link
              href="https://youtube.com"
              target="_blank"
              className="text-gray-300 hover:text-cyan-400"
            >
              <Youtube className="w-5 h-5" />
            </Link>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={scrollToTop}
            className="flex items-center space-x-2 bg-cyan-600/80 backdrop-blur-sm text-white border-0 hover:bg-cyan-500/80 transition-colors shadow-md"
          >
            <ChevronUp className="w-4 h-4" />
            <span>Back to Top</span>
          </Button>
        </div>
      </div>

      {/* Bottom line */}
      <div className="border-t border-blue-200/10 text-center py-4 text-sm text-gray-400">
        © {new Date().getFullYear()} Lyhan Fan Project. All rights reserved.
      </div>
    </footer>
  )
}
