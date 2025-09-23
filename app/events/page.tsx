import { EventsTimeline } from "@/components/events-timeline"

export default function EventsPage() {
  return (
    <div className="container mx-auto px-4 py-8 mt-24">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Events</h1>
          <p className="text-muted-foreground text-lg">Upcoming concerts, appearances, and special events</p>
        </div>

        <EventsTimeline />
      </div>
    </div>
  )
}
