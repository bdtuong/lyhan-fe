"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Music,
  ImageIcon,
  Calendar,
  Users,
  User,
  Home,
  Wand2,
  ChevronDown,
  LayoutGrid,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useAuth } from "@/context/AuthContext"

const baseItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/music", label: "Music", icon: Music },
  { href: "/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/editor", label: "Custom", icon: Wand2 },
]

const mediaItems = [
  { href: "/socials", label: "Socials", icon: Users },
  { href: "/events", label: "Events", icon: Calendar },
]

export function Navigation() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [showNav, setShowNav] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  const [openUserMenu, setOpenUserMenu] = useState(false)
  const [openMediaMenu, setOpenMediaMenu] = useState(false)

  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileMediaOpen, setMobileMediaOpen] = useState(false)

  const userMenuRef = useRef<HTMLDivElement | null>(null)
  const mediaMenuRef = useRef<HTMLDivElement | null>(null)

  const { user, setUser } = useAuth()

  // hide/show on scroll + scrolled style
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      setScrolled(currentY > 10)
      setShowNav(currentY <= lastScrollY)
      setLastScrollY(currentY)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  // click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setOpenUserMenu(false)
      }
      if (mediaMenuRef.current && !mediaMenuRef.current.contains(e.target as Node)) {
        setOpenMediaMenu(false)
      }
    }
    window.addEventListener("mousedown", handleClickOutside)
    return () => window.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const mediaActive = mediaItems.some(i => pathname.startsWith(i.href))

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300 backdrop-blur-xl text-white",
        // hơi trong suốt
        "supports-[backdrop-filter]:bg-slate-900/45 bg-slate-900/55 border-b border-white/10",
        scrolled ? "shadow-lg py-2" : "py-3",
        showNav ? "translate-y-0" : "-translate-y-full"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent"
          >
            Lyhan
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-6">
            {baseItems.map((item) => {
              const Icon = item.icon
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors group",
                    active ? "text-blue-300" : "text-gray-200/85 hover:text-blue-300"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-blue-400/80 transition-all duration-300 group-hover:w-full" />
                </Link>
              )
            })}

            {/* Media dropdown */}
            <div className="relative" ref={mediaMenuRef}>
              <button
                onClick={() => setOpenMediaMenu(v => !v)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition",
                  mediaActive ? "text-blue-300" : "text-gray-200/85 hover:text-blue-300",
                  "hover:bg-white/5"
                )}
                aria-haspopup="menu"
                aria-expanded={openMediaMenu}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Media</span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform",
                    openMediaMenu ? "rotate-180" : "rotate-0"
                  )}
                />
              </button>

              {openMediaMenu && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 min-w-48 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl py-1"
                >
                  {mediaItems.map((item) => {
                    const Icon = item.icon
                    const active = pathname.startsWith(item.href)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 text-sm",
                          active
                            ? "text-blue-300 bg-white/5"
                            : "text-gray-200/90 hover:text-white hover:bg-white/5"
                        )}
                        onClick={() => setOpenMediaMenu(false)}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* User dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setOpenUserMenu((prev) => !prev)}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/10 text-gray-200/90 hover:text-blue-300 transition"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Avatar"
                    className="w-7 h-7 rounded-full object-cover border border-slate-600"
                  />
                ) : (
                  <User className="w-5 h-5" />
                )}
                <span>{user?.username || "User"}</span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform",
                    openUserMenu ? "rotate-180" : "rotate-0"
                  )}
                />
              </button>

              {openUserMenu && (
                <div className="absolute right-0 mt-2 w-44 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-md shadow-lg py-1 text-sm">
                  {user ? (
                    <>
                      <Link
                        href={`/profile/${user._id || user.id}`}
                        className="block px-4 py-2 hover:bg-white/5 text-gray-200"
                        onClick={() => setOpenUserMenu(false)}
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          localStorage.removeItem("token")
                          setUser(null)
                          window.location.href = "/"
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-white/5 text-red-400"
                      >
                        Log out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/auth/login"
                        className="block px-4 py-2 hover:bg-white/5 text-gray-200"
                        onClick={() => setOpenUserMenu(false)}
                      >
                        Login
                      </Link>
                      <Link
                        href="/auth/register"
                        className="block px-4 py-2 hover:bg-white/5 text-gray-200"
                        onClick={() => setOpenUserMenu(false)}
                      >
                        Register
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile button */}
          <div className="md:hidden">
            <button
              className="p-2 rounded-md text-gray-200/90 hover:text-blue-300 hover:bg-white/10"
              aria-label="Toggle Menu"
              onClick={() => setMobileOpen(v => !v)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        {mobileOpen && (
          <div className="md:hidden mt-3 pb-3 border-t border-white/10">
            <div className="flex flex-col gap-1 pt-3">
              {baseItems.map((item) => {
                const Icon = item.icon
                const active = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md",
                      active
                        ? "text-blue-300 bg-white/5"
                        : "text-gray-200/90 hover:text-white hover:bg-white/5"
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                )
              })}

              {/* Mobile Media accordion */}
              <button
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-md",
                  mediaActive ? "text-blue-300 bg-white/5" : "text-gray-200/90 hover:bg-white/5"
                )}
                onClick={() => setMobileMediaOpen(v => !v)}
                aria-expanded={mobileMediaOpen}
              >
                <span className="flex items-center gap-3">
                  <LayoutGrid className="w-5 h-5" />
                  Media
                </span>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 transition-transform",
                    mobileMediaOpen ? "rotate-180" : "rotate-0"
                  )}
                />
              </button>
              {mobileMediaOpen && (
                <div className="ml-8 flex flex-col gap-1">
                  {mediaItems.map((item) => {
                    const Icon = item.icon
                    const active = pathname.startsWith(item.href)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-md text-sm",
                          active
                            ? "text-blue-300 bg-white/5"
                            : "text-gray-200/90 hover:text-white hover:bg-white/5"
                        )}
                        onClick={() => {
                          setMobileOpen(false)
                          setMobileMediaOpen(false)
                        }}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Mobile auth quick actions */}
            <div className="mt-3 border-t border-white/10 pt-3">
              {user ? (
                <div className="flex items-center justify-between px-3">
                  <Link
                    href={`/profile/${user._id || user.id}`}
                    className="text-gray-200 hover:text-white"
                    onClick={() => setMobileOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    className="text-red-400 hover:text-red-300"
                    onClick={() => {
                      localStorage.removeItem("token")
                      setUser(null)
                      window.location.href = "/"
                    }}
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-3">
                  <Link href="/auth/login" className="text-gray-200 hover:text-white" onClick={() => setMobileOpen(false)}>Login</Link>
                  <Link href="/auth/register" className="text-gray-200 hover:text-white" onClick={() => setMobileOpen(false)}>Register</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
