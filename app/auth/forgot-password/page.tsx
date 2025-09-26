"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { forgotPassword } from "@/services/auth.services"
import LiquidGlass from "@/components/ui/liquid-glass"
import { EffectiveInput } from "@/components/ui/effective-input"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    try {
      const res = await forgotPassword(email)
      setMessage(res.message) // BE trả { message: 'Password reset email sent' }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-[#0d1a36] relative">
      <LiquidGlass className="relative z-10 w-full max-w-md p-8 rounded-2xl" disableTransform>
        <h1 className="text-3xl font-bold text-center text-cyan-300 mb-6">Quên mật khẩu</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <EffectiveInput label="Email" type="email" value={email} onChange={setEmail} />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {message && <p className="text-green-400 text-sm">{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:opacity-90 transition"
          >
            {loading ? "Đang gửi..." : "Gửi yêu cầu"}
          </button>
        </form>
      </LiquidGlass>
    </div>
  )
}
