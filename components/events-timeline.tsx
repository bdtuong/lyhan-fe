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
import toast from "react-hot-toast"

export function EventsTimeline() {
  const [events, setEvents] = useState<Event[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const { create, update, remove, join, leave } = useEvents()

  useEffect(() => {
    getEvents()
      .then((res) => setEvents(res.events || []))
      .catch((error) => {
        console.error("❌ Failed to fetch events:", error)
        toast.error("Failed to load events.")
      })
  }, [])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      const decoded = decodeJWT(token)
      if (decoded?.admin === true) setIsAdmin(true)
      if (decoded?.id) setCurrentUserId(decoded.id)
    }
  }, [])

  const upcomingEvents = events.filter((e) => new Date(e.endTime) > new Date())
  const pastEvents = events.filter((e) => new Date(e.endTime) <= new Date())

  const EventCard = ({ event }: { event: Event }) => {
    const start = new Date(event.startTime)
    const end = new Date(event.endTime)
    const [editing, setEditing] = useState(false)

    const token = localStorage.getItem("token") || ""
    const isJoined = event.participants?.includes(currentUserId || "")

    const handleJoin = async () => {
      if (!token) return alert("You need to log in to join.")
      const toastId = toast.loading("Joining...")
      const result = await join(event._id, token)
      if (result) {
        toast.success("Joined successfully!", { id: toastId })
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
      } else toast.error("Join failed.", { id: toastId })
    }

    const handleLeave = async () => {
      if (!token) return alert("You need to log in to leave.")
      const toastId = toast.loading("Leaving...")
      const result = await leave(event._id, token)
      if (result) {
        toast.success("Left the event.", { id: toastId })
        setEvents((prev) =>
          prev.map((ev) =>
            ev._id === event._id
              ? {
                  ...ev,
                  participants: ev.participants?.filter((id) => id !== currentUserId),
                }
              : ev
          )
        )
      } else toast.error("Leave failed.", { id: toastId })
    }

    const handleDelete = async () => {
      if (!confirm("Are you sure you want to delete this event?")) return
      const toastId = toast.loading("Deleting...")
      const result = await remove(event._id, token)
      if (result) {
        toast.success("Event deleted.", { id: toastId })
        setEvents((prev) => prev.filter((ev) => ev._id !== event._id))
      } else toast.error("Delete failed.", { id: toastId })
    }

    return (
      <Card className="bg-black text-white border border-white/20 shadow-sm transition hover:shadow-xl">
        <CardContent className="p-6 space-y-4">
          {!editing ? (
            <div className="flex flex-col md:flex-row gap-6">
              {/* Thumbnail */}
              <div className="md:w-48 h-32 rounded-lg overflow-hidden bg-zinc-900 flex items-center justify-center">
                {event.images?.[0] ? (
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${event.images[0]})` }}
                  />
                ) : (
                  <div className="text-gray-500 text-sm">No Image</div>
                )}
              </div>

              {/* Event Info */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold">{event.title}</h3>
                  {isAdmin && currentUserId === event.createdByID && (
                    <Badge variant="outline" className="text-white border-white/30">
                      Mine
                    </Badge>
                  )}
                </div>

                <div className="text-sm space-y-1 text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{start.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>
                      {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} –{" "}
                      {end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{event.participants?.length || 0} attendees</span>
                  </div>
                </div>

                <p className="text-sm text-gray-400">{event.description}</p>

                {/* Map preview */}
                {event.location && (
                  <div className="w-full h-48 rounded-md overflow-hidden mt-2">
                    <iframe
                      title="map"
                      className="w-full h-full border-none"
                      loading="lazy"
                      src={`https://www.google.com/maps?q=${encodeURIComponent(
                        event.location
                      )}&output=embed`}
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-3">
                  {isAdmin && currentUserId === event.createdByID ? (
                    <>
                      <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={handleDelete}>
                        Delete
                      </Button>
                    </>
                  ) : isJoined ? (
                    <Button size="sm" variant="secondary" onClick={handleLeave}>
                      Leave
                    </Button>
                  ) : (
                    <Button size="sm" onClick={handleJoin}>
                      Join
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <EventForm
              mode="edit"
              initialData={event}
              onSubmit={async (formData) => {
                const toastId = toast.loading("Updating...")
                const result = await update(event._id, formData, token)
                if (result) {
                  toast.success("Updated successfully!", { id: toastId })
                  setEditing(false)
                  const res = await getEvents()
                  setEvents(res.events || [])
                } else {
                  toast.error("Update failed.", { id: toastId })
                }
              }}
            />
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-12 max-w-5xl mx-auto px-4 py-10 text-white">
      {isAdmin && (
        <div className="bg-zinc-950 text-white border border-white/20 rounded-xl p-6 shadow-lg">
          <EventForm
            mode="create"
            onSubmit={async (formData) => {
              const token = localStorage.getItem("token") || ""
              const toastId = toast.loading("Creating event...")
              const newEvent = await create(formData, token)
              if (newEvent) {
                toast.success("Event created!", { id: toastId })
                setEvents((prev) => [newEvent, ...prev])
              } else toast.error("Create failed.", { id: toastId })
            }}
          />
        </div>
      )}

      {upcomingEvents.length === 0 && pastEvents.length === 0 && (
        <p className="text-center text-gray-400 py-12 text-lg">
          No events available. Stay tuned! ✨
        </p>
      )}

      {upcomingEvents.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-white" />
            Upcoming Events
          </h2>
          <div className="space-y-6">
            {upcomingEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        </section>
      )}

      {pastEvents.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 text-gray-400">
            <Clock className="w-6 h-6" />
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
