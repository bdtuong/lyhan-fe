"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { register as registerApi, loginWithGoogleRedirect } from "@/services/auth.services"
import { Eye, EyeOff, Mail, User, Lock, Loader2, Chrome } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const { loadUser } = useAuth()

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      setLoading(false)
      return
    }

    try {
      const data = await registerApi(username, email, password, confirmPassword)
      localStorage.setItem("token", data.access_token)
      await loadUser()
      router.push("/")
    } catch (err: any) {
      setError(err?.message || "Register failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-800 flex items-center justify-center px-4">
      <div className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-zinc-700 shadow-2xl rounded-2xl w-full max-w-md p-8 space-y-6">
        {/* Header (match Login) */}
        <div className="flex flex-col items-center space-y-2">
          <div className="bg-white/20 rounded-full p-3">
            <User className="text-white w-6 h-6" />
          </div>
          <h1 className="text-white text-2xl font-semibold">Create your LYHANVERSE account</h1>
          <p className="text-zinc-300 text-sm">Join us in seconds</p>
        </div>

        {/* Google button (match Login style) */}
        <button
          onClick={loginWithGoogleRedirect}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-white/30 hover:border-white/50 transition bg-white/10 hover:bg-white/20 text-white font-medium text-sm"
        >
          <Chrome className="w-4 h-4" />
          Sign up with Google
        </button>

        {/* Divider (match Login) */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/20" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-transparent px-2 text-zinc-300">or</span>
          </div>
        </div>

        {/* Form (same input styles as Login) */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-white/5 text-white placeholder:text-zinc-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              required
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-white/5 text-white placeholder:text-zinc-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-10 pl-10 pr-10 rounded-lg bg-white/5 text-white placeholder:text-zinc-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-10 pl-10 pr-10 rounded-lg bg-white/5 text-white placeholder:text-zinc-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition"
          >
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : null}
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {/* Footer (match Login) */}
        <div className="text-center text-sm text-zinc-300 space-y-1 pt-2">
          <p>
            Already have an account?{" "}
            <span
              onClick={() => router.push("/auth/login")}
              className="text-cyan-400 hover:underline cursor-pointer"
            >
              Sign in
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
