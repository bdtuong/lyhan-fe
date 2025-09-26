"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import LiquidGlass from "@/components/ui/liquid-glass"
import { EffectiveInput } from "@/components/ui/effective-input"
import { login } from "@/services/auth.services"
import { useAuth } from "@/context/AuthContext"

export default function LoginPage() {
  const router = useRouter()
  const { loadUser } = useAuth() // 👈 lấy từ context
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const data = await login(email, password)
      console.log("[LoginPage] received token:", data.access_token)

      localStorage.setItem("token", data.access_token)
      await loadUser() // 👈 gọi context để update user
      router.push("/")
    } catch (err: any) {
      console.error("[LoginPage] login failed:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-[#0d1a36] relative overflow-hidden"
      )}
    >
      {/* Hiệu ứng bóng tròn xanh lam */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <LiquidGlass
        className="relative z-10 w-full max-w-md p-8 rounded-2xl"
        disableTransform
      >
        <h1 className="text-3xl font-bold text-center text-cyan-300 mb-6">
          Đăng nhập
        </h1>
        <form onSubmit={handleLogin} className="space-y-5">
          <EffectiveInput
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
          />
          <EffectiveInput
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={setPassword}
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:opacity-90 transition"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
          <p className="mt-4 text-center text-gray-400 text-sm">
            <span
              onClick={() => router.push("/auth/forgot-password")}
              className="text-cyan-300 hover:underline cursor-pointer"
            >
              Quên mật khẩu?
            </span>
          </p>
        </form>
        <p className="mt-4 text-center text-gray-400 text-sm">
          Chưa có tài khoản?{" "}
          <span
            onClick={() => router.push("/auth/register")}
            className="text-cyan-300 hover:underline cursor-pointer"
          >
            Đăng ký
          </span>
        </p>
      </LiquidGlass>
    </div>
  )
}
