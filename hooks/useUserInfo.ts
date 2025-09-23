"use client"

import { useEffect, useState } from "react"
import { getUser } from "@/services/auth.services"

export type UserInfo = {
  username: string
  avatar: string
}

export function useUserInfo(userId?: string) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return

    const token = localStorage.getItem("token") || ""
    if (!token) return

    setLoading(true)
    getUser(userId, token)
      .then((user) => {
        setUserInfo({
          username: user.username || "Ẩn danh",
          avatar: Array.isArray(user.avatar) ? user.avatar[0] : user.avatar || "/avatars/default.png",
        })
      })
      .catch(() => setError("Không lấy được thông tin user"))
      .finally(() => setLoading(false))
  }, [userId])

  return { userInfo, loading, error }
}
