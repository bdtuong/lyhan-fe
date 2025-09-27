import { EventsTimeline } from "@/components/events-timeline"

export default function EventsPage() {
  return (
    <div
      className="min-h-screen bg-top bg-repeat"
      style={{
        backgroundImage: "url('/background.jpg')",
        backgroundSize: "100% auto",
      }}
    >
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">🌸 Sự kiện sắp tới 🌸</h1>
            <p className="text-lg text-pink-200">
              Những buổi biểu diễn, buổi gặp gỡ và hoạt động đặc biệt dễ thương đang chờ bạn ✨
            </p>
          </div>

          <EventsTimeline />
        </div>
      </div>
    </div>
  )
}
