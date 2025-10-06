"use client"

import { ChevronUp, Facebook, Instagram, Youtube } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="relative bg-black text-white overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-900/50 to-black pointer-events-none" />
      
      <div className="relative container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
          {/* Logo + description */}
          <div className="md:col-span-5 space-y-6">
            <h2 className="text-5xl font-black tracking-tighter text-white">
              LYHANVERSE
            </h2>
            <p className="text-base text-zinc-400 max-w-sm leading-relaxed">
              Official fan project. Designed with love for the community.
            </p>
            
            {/* Social icons */}
            <div className="flex gap-3 pt-2">
              {[
                { href: "https://www.facebook.com/profile.php?id=100075664732643", icon: Facebook },
                { href: "https://www.instagram.com/__lyhan__/", icon: Instagram },
                { href: "https://www.youtube.com/channel/UCWBhNrnr35nhNYS3PJBRP4Q", icon: Youtube },
              ].map(({ href, icon: Icon }, i) => (
                <Link
                  key={i}
                  href={href}
                  target="_blank"
                  className="group p-3 rounded-2xl bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-all duration-300 border border-white/10 hover:border-white/20"
                >
                  <Icon className="w-5 h-5 text-zinc-400 group-hover:text-white group-hover:scale-110 transition-all duration-300" />
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              Explore More
            </h3>
            <nav className="flex flex-col space-y-3">
              {[
                { href: "/socials", label: "Socials" },
                { href: "/music", label: "Music" },
                { href: "/gallery", label: "Gallery" },
                { href: "/events", label: "Events" },
                { href: "/about", label: "About" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="group relative text-zinc-400 hover:text-white transition-colors duration-300 w-fit"
                >
                  <span className="relative z-10">{label}</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300" />
                </Link>
              ))}
            </nav>
          </div>

          {/* Stay Updated section */}
          <div className="md:col-span-4 space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              Stay Updated
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Never miss an update. Follow us on social media for the latest news and content.
            </p>
          </div>
        </div>

        {/* Bottom line */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-zinc-500">
            © {new Date().getFullYear()} Lyhan Fan Project. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-zinc-500">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>

    </footer>
  )
}