"use client"

import { useState } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { resetPassword } from "@/services/auth.services"
import LiquidGlass from "@/components/ui/liquid-glass"
import { EffectiveInput } from "@/components/ui/effective-input"

export default function ResetPasswordPage() {
  const router = useRouter()
  const { token } = useParams() as { token: string }
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    try {
      const res = await resetPassword(token, email, password, confirmPassword)
      setMessage(res.message) // BE trả { message: "Password reset successfully" }
      // Sau khi đổi mật khẩu thành công → chuyển về trang login
      setTimeout(() => router.push("/auth/login"), 2000)
    } catch (err: any) {
      setError(err.message || "Đặt lại mật khẩu thất bại")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-[#0d1a36] relative">
      <LiquidGlass className="relative z-10 w-full max-w-md p-8 rounded-2xl" disableTransform>
        <h1 className="text-3xl font-bold text-center text-cyan-300 mb-6">
          Đặt lại mật khẩu
        </h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <EffectiveInput
            label="Mật khẩu mới"
            type="password"
            value={password}
            onChange={setPassword}
          />
          <EffectiveInput
            label="Xác nhận mật khẩu"
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {message && <p className="text-green-400 text-sm">{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:opacity-90 transition"
          >
            {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
          </button>
        </form>
      </LiquidGlass>
    </div>
  )
}
