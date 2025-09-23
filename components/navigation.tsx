"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Music, ImageIcon, Calendar, Users, User, Home } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useAuth } from "@/context/AuthContext"

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/music", label: "Music", icon: Music },
  { href: "/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/socials", label: "Socials", icon: Users },
  { href: "/about", label: "About", icon: User },
]

export function Navigation() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [showNav, setShowNav] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [openUserMenu, setOpenUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const { user, setUser } = useAuth()

  // handle scroll hide/show
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      setScrolled(currentY > 10)
      if (currentY > lastScrollY) {
        setShowNav(false)
      } else {
        setShowNav(true)
      }
      setLastScrollY(currentY)
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenUserMenu(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    window.addEventListener("mousedown", handleClickOutside)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("mousedown", handleClickOutside)
    }
  }, [lastScrollY])

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300",
        "backdrop-blur-xl text-white",
        "bg-gradient-to-r from-slate-900/80 via-slate-800/70 to-slate-900/80",
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
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors group",
                    pathname === item.href
                      ? "text-blue-400"
                      : "text-gray-300 hover:text-blue-400"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-blue-400 transition-all duration-300 group-hover:w-full" />
                </Link>
              )
            })}

            {/* User dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setOpenUserMenu((prev) => !prev)}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/10 text-gray-300 hover:text-blue-400 transition"
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
              </button>

              {openUserMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-slate-800 border border-slate-700 rounded-md shadow-lg py-1 text-sm">
                  {user ? (
                    <>
                      <Link
                        href={`/profile/${user._id || user.id}`} // ✅ profile chính mình
                        className="block px-4 py-2 hover:bg-slate-700 text-gray-200"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          localStorage.removeItem("token")
                          setUser(null)
                          window.location.href = "/"
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-slate-700 text-red-400"
                      >
                        Log out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/auth/login"
                        className="block px-4 py-2 hover:bg-slate-700 text-gray-200"
                      >
                        Login
                      </Link>
                      <Link
                        href="/auth/register"
                        className="block px-4 py-2 hover:bg-slate-700 text-gray-200"
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
            <button className="p-2 rounded-md text-gray-300 hover:text-blue-400 hover:bg-white/10">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
