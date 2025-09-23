"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Clock, Users } from "lucide-react"
import { decodeJWT } from "@/utils/jwt"
import { getEvents } from "@/services/event.services"
import { useEvents, type Event } from "@/hooks/useEvents"
import { EventForm } from "@/components/EventForm"

export function EventsTimeline() {
  const [events, setEvents] = useState<Event[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const { create, update, remove, join, leave } = useEvents()

  // Fetch events từ BE
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await getEvents()
        setEvents(res.events || [])
      } catch (error) {
        console.error("❌ Lỗi fetch events:", error)
      }
    }
    fetchEvents()
  }, [])

  // Decode token để check role & userId
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      const decoded = decodeJWT(token)
      if (decoded?.admin === true) setIsAdmin(true)
      if (decoded?.id) setCurrentUserId(decoded.id)
    }
  }, [])

  const upcomingEvents = events.filter(
    (event) => new Date(event.endTime) > new Date()
  )
  const pastEvents = events.filter(
    (event) => new Date(event.endTime) <= new Date()
  )

  const EventCard = ({ event }: { event: Event }) => {
    const start = new Date(event.startTime)
    const end = new Date(event.endTime)
    const [editing, setEditing] = useState(false)

    const token = localStorage.getItem("token") || ""
    const isJoined = event.participants?.includes(currentUserId || "")

    const handleJoin = async () => {
      if (!token) return alert("Bạn cần đăng nhập để tham gia sự kiện")
      const result = await join(event._id, token)
      if (result) {
        setEvents((prev) =>
          prev.map((ev) =>
            ev._id === event._id
              ? {
                  ...ev,
                  participants: [...(ev.participants || []), currentUserId!],
                }
              : ev
          )
        )
      }
    }

    const handleLeave = async () => {
      if (!token) return alert("Bạn cần đăng nhập để hủy tham gia")
      const result = await leave(event._id, token)
      if (result) {
        setEvents((prev) =>
          prev.map((ev) =>
            ev._id === event._id
              ? {
                  ...ev,
                  participants: (ev.participants || []).filter(
                    (id) => id !== currentUserId
                  ),
                }
              : ev
          )
        )
      }
    }

    const handleDelete = async (id: string) => {
      if (confirm("Bạn có chắc chắn muốn xóa sự kiện này?")) {
        await remove(id, token)
        setEvents((prev) => prev.filter((ev) => ev._id !== id))
      }
    }

    return (
      <Card className="transition-all duration-300 hover:shadow-lg">
        <CardContent className="p-6 space-y-4">
          {!editing ? (
            <>
              <div className="flex flex-col md:flex-row gap-6">
                {/* Event Image */}
                <div className="md:w-48 h-32 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                  {event.images && event.images.length > 0 ? (
                    <div
                      className="w-full h-full bg-cover bg-center"
                      style={{ backgroundImage: `url('${event.images[0]}')` }}
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-200 flex items-center justify-center text-gray-500">
                      No Image
                    </div>
                  )}
                </div>

                {/* Event Details */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                    {isAdmin && currentUserId === event.createdByID && (
                      <Badge variant="outline">Của tôi</Badge>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {start.toLocaleDateString("vi-VN", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>
                        {start.toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {" - "}
                        {end.toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>
                        {(event.participants?.length || 0)} người tham gia
                      </span>
                    </div>
                  </div>

                  <p className="text-muted-foreground">{event.description}</p>

                  {/* Nút Actions */}
                  {isAdmin && currentUserId === event.createdByID ? (
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditing(true)}
                      >
                        Sửa
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(event._id)}
                      >
                        Xóa
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2 pt-2">
                      {isJoined ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={handleLeave}
                        >
                          Hủy tham gia
                        </Button>
                      ) : (
                        <Button size="sm" onClick={handleJoin}>
                          Tham gia
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <EventForm
              mode="edit"
              initialData={event}
              onSubmit={async (formData) => {
                await update(event._id, formData, token)
                setEditing(false)
              }}
            />
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-12">
      {/* Form tạo event cho admin */}
      {isAdmin && (
        <EventForm
          mode="create"
          onSubmit={async (formData) => {
            const token = localStorage.getItem("token") || ""
            await create(formData, token)
          }}
        />
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            Upcoming Events
          </h2>

          <div className="space-y-6">
            {upcomingEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6 text-muted-foreground" />
            Past Events
          </h2>

          <div className="space-y-6">
            {pastEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
