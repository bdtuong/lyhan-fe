"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { decodeJWT } from "@/utils/jwt"
import { getUser } from "@/services/auth.services"

type User = {
  _id: string
  id: string
  username: string
  avatar?: string
  token: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
  loadUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const loadUser = async () => {
    setLoading(true)
    const token = localStorage.getItem("token")
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    const decoded = decodeJWT(token)
    if (!decoded?.id) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const data = await getUser(decoded.id, token)
      setUser({
        _id: data._id, // lấy từ DB
        id: decoded.id, // từ JWT
        username: data.username,
        avatar: data.avatar,
        token
      })
    } catch (err) {
      console.error("[AuthContext] loadUser failed:", err)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUser()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, setUser, loadUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
