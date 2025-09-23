"use client"

import { useState, useCallback } from "react"
import {
  getEvents,
  getEventById,
  searchEvents,
  joinEvent,
  leaveEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} from "@/services/event.services"

// 🟦 Kiểu dữ liệu Event theo BE
export type Event = {
  _id: string
  title: string
  description: string
  location: string
  startTime: string
  endTime: string
  images: string[]
  participants?: string[]
  likes?: any[]
  hashtags?: string[]
  participantsCount?: number
  likesCount?: number
  createdByID?: string
  createdAt?: string
  updatedAt?: string | null
  _destroy?: boolean
}

// 🟦 Kiểu dữ liệu trả về khi phân trang
export type PaginatedEvents = {
  events: Event[]
  totalCount: number
  currentPage?: number
  totalPages?: number
}

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 🟦 Lấy danh sách event (pagination)
  const fetchEvents = useCallback(async (page = 1, pageSize = 10) => {
    setLoading(true)
    setError(null)
    try {
      const data: PaginatedEvents = await getEvents(page, pageSize)
      setEvents(data.events || [])
      setTotal(data.totalCount || 0)
    } catch (err: any) {
      setError(err.message || "Failed to fetch events")
    } finally {
      setLoading(false)
    }
  }, [])

  // 🟦 Lấy chi tiết event
  const fetchEventById = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const event: Event = await getEventById(id)
      return event
    } catch (err: any) {
      setError(err.message || "Failed to fetch event")
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // 🟦 Search events
  const search = useCallback(async (query: string) => {
    setLoading(true)
    setError(null)
    try {
      const data: Event[] = await searchEvents(query)
      setEvents(data || [])
      setTotal(data.length || 0)
    } catch (err: any) {
      setError(err.message || "Failed to search events")
    } finally {
      setLoading(false)
    }
  }, [])

  // 🟦 User join event
  const join = useCallback(async (eventId: string, token: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await joinEvent(eventId, token)
      setEvents((prev) =>
        prev.map((ev) =>
          ev._id === eventId
            ? {
                ...ev,
                participants: [...(ev.participants || []), result.userId],
              }
            : ev
        )
      )
      return result
    } catch (err: any) {
      setError(err.message || "Failed to join event")
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // 🟦 User leave event
  const leave = useCallback(async (eventId: string, token: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await leaveEvent(eventId, token)
      setEvents((prev) =>
        prev.map((ev) =>
          ev._id === eventId
            ? {
                ...ev,
                participants: (ev.participants || []).filter(
                  (id: string) => id !== result.userId
                ),
              }
            : ev
        )
      )
      return result
    } catch (err: any) {
      setError(err.message || "Failed to leave event")
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // 🟦 Admin create event
  const create = useCallback(async (data: FormData, token: string) => {
    setLoading(true)
    setError(null)
    try {
      const result: Event = await createEvent(data, token)
      setEvents((prev) => [result, ...prev])
      return result
    } catch (err: any) {
      setError(err.message || "Failed to create event")
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // 🟦 Admin update event
  const update = useCallback(
    async (id: string, data: FormData, token: string) => {
      setLoading(true)
      setError(null)
      try {
        const result: Event = await updateEvent(id, data, token)
        setEvents((prev) =>
          prev.map((ev) => (ev._id === id ? { ...ev, ...result } : ev))
        )
        return result
      } catch (err: any) {
        setError(err.message || "Failed to update event")
        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  // 🟦 Admin delete event
  const remove = useCallback(async (id: string, token: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await deleteEvent(id, token)
      setEvents((prev) => prev.filter((ev) => ev._id !== id))
      return result
    } catch (err: any) {
      setError(err.message || "Failed to delete event")
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    events,
    total,
    loading,
    error,
    fetchEvents,
    fetchEventById,
    search,
    join,
    leave,
    create,
    update,
    remove,
  }
}
