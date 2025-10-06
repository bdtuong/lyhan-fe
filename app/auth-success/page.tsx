'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { decodeJWT } from "@/utils/jwt"

export default function AuthSuccessPage() {
  const router = useRouter()
  const { loadUser } = useAuth()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    if (token) {
      localStorage.setItem('token', token)
      const decoded = decodeJWT(token)
      console.log('[auth-success] ✅ token decoded:', decoded)

      loadUser().then(() => {
        router.push('/') // hoặc /dashboard, /profile tuỳ app
      })
    } else {
      router.push('/auth/login')
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <p>Signing you in with Google...</p>
    </div>
  )
}
