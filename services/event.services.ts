import axios from "axios"
import type { Event, PaginatedEvents } from "@/hooks/useEvents"

const API_URL = process.env.NEXT_PUBLIC_API_URL

// 🟦 Tạo event (admin)
export async function createEvent(data: FormData, token: string): Promise<Event> {
  const res = await axios.post(`${API_URL}/v1/events`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      // ❌ Không set Content-Type, axios sẽ tự set boundary cho FormData
    },
    withCredentials: true,
  })
  return res.data
}

// 🟦 Lấy danh sách events
export async function getEvents(page = 1, pageSize = 10): Promise<PaginatedEvents> {
  const res = await axios.get(`${API_URL}/v1/events`, {
    params: { page, pageSize },
    withCredentials: true,
  })
  return res.data
}

// 🟦 Lấy chi tiết 1 event
export async function getEventById(id: string): Promise<Event> {
  const res = await axios.get(`${API_URL}/v1/events/${id}`, {
    withCredentials: true,
  })
  return res.data
}

// 🟦 Search events
export async function searchEvents(query: string): Promise<Event[]> {
  const res = await axios.get(`${API_URL}/v1/events/search`, {
    params: { q: query },
    withCredentials: true,
  })
  return res.data
}

// 🟦 User tham gia event
export async function joinEvent(eventId: string, token: string): Promise<{ userId: string }> {
  const res = await axios.post(
    `${API_URL}/v1/events/${eventId}/join`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    }
  )
  return res.data
}

// 🟦 User rời event
export async function leaveEvent(eventId: string, token: string): Promise<{ userId: string }> {
  const res = await axios.post(
    `${API_URL}/v1/events/${eventId}/leave`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    }
  )
  return res.data
}

// 🟦 Admin update event
export async function updateEvent(id: string, data: FormData, token: string): Promise<Event> {
  const res = await axios.put(`${API_URL}/v1/events/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  })
  return res.data
}

// 🟦 Admin delete event
export async function deleteEvent(id: string, token: string): Promise<{ message: string }> {
  const res = await axios.delete(`${API_URL}/v1/events/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  })
  return res.data
}
