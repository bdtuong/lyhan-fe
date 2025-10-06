"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { login, loginWithGoogleRedirect } from "@/services/auth.services"
import { useAuth } from "@/context/AuthContext"
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Loader2,
  LogIn,
  LucideIcon,
  Chrome
} from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { loadUser } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await login(email, password)
      localStorage.setItem("token", res.access_token)
      await loadUser()
      router.push("/")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-800 flex items-center justify-center px-4">
      <div className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-zinc-700 shadow-2xl rounded-2xl w-full max-w-md p-8 space-y-6">
        <div className="flex flex-col items-center space-y-2">
          <div className="bg-white/20 rounded-full p-3">
            <User className="text-white w-6 h-6" />
          </div>
          <h1 className="text-white text-2xl font-semibold">Welcome to LYHANVERSE</h1>
          <p className="text-zinc-300 text-sm">Please sign in to continue</p>
        </div>

        {/* Google login button */}
        <button
          onClick={loginWithGoogleRedirect}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-white/30 hover:border-white/50 transition bg-white/10 hover:bg-white/20 text-white font-medium text-sm"
        >
          <Chrome className="w-4 h-4" />
          Sign in with Google
        </button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/20" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-transparent px-2 text-zinc-300">or</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-white/5 text-white placeholder:text-zinc-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-10 pl-10 pr-10 rounded-lg bg-white/5 text-white placeholder:text-zinc-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition"
          >
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="text-center text-sm text-zinc-300 space-y-1 pt-2">
          <p>
            <span
              onClick={() => router.push("/auth/forgot-password")}
              className="text-cyan-400 hover:underline cursor-pointer"
            >
              Forgot password?
            </span>
          </p>
          <p>
            Don't have an account?{" "}
            <span
              onClick={() => router.push("/auth/register")}
              className="text-cyan-400 hover:underline cursor-pointer"
            >
              Sign up
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
