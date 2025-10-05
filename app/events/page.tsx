import { EventsTimeline } from "@/components/events-timeline"

export default function EventsPage() {
  return (
    <div
    >
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-4xl mx-auto">
          <EventsTimeline />
        </div>
      </div>
    </div>
  )
}
