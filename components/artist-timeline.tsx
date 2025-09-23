import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const timelineEvents = [
  {
    year: "2024",
    title: "World Tour Announcement",
    description: "Announced the biggest world tour yet, spanning 6 continents and 50+ cities.",
    type: "tour",
  },
  {
    year: "2023",
    title: "Latest Album Release",
    description: "Released the critically acclaimed album that debuted at #1 on multiple charts worldwide.",
    type: "album",
  },
  {
    year: "2022",
    title: "Grammy Nomination",
    description: "Received first Grammy nomination for Best Pop Vocal Album, marking a career milestone.",
    type: "award",
  },
  {
    year: "2021",
    title: "Breakthrough Single",
    description: "Released the hit single that became a global phenomenon, reaching #1 in 15 countries.",
    type: "single",
  },
  {
    year: "2020",
    title: "Debut Album",
    description: "Released debut studio album during the pandemic, connecting with fans through virtual concerts.",
    type: "album",
  },
  {
    year: "2019",
    title: "First Record Deal",
    description: "Signed with major record label after viral social media performances gained industry attention.",
    type: "milestone",
  },
  {
    year: "2018",
    title: "Musical Journey Begins",
    description: "Started sharing original music online, building a dedicated fanbase through authentic storytelling.",
    type: "beginning",
  },
]

export function ArtistTimeline() {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "album":
        return "bg-primary"
      case "single":
        return "bg-secondary"
      case "tour":
        return "bg-accent"
      case "award":
        return "bg-yellow-500"
      case "milestone":
        return "bg-purple-500"
      case "beginning":
        return "bg-gray-500"
      default:
        return "bg-muted"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "album":
        return "Album"
      case "single":
        return "Single"
      case "tour":
        return "Tour"
      case "award":
        return "Award"
      case "milestone":
        return "Milestone"
      case "beginning":
        return "Beginning"
      default:
        return "Event"
    }
  }

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-6 text-center">Musical Journey</h2>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />

        <div className="space-y-8">
          {timelineEvents.map((event, index) => (
            <div key={index} className="relative flex items-start gap-6">
              {/* Timeline Dot */}
              <div className={`w-4 h-4 ${getTypeColor(event.type)} rounded-full border-4 border-background z-10`} />

              {/* Event Card */}
              <Card className="flex-1 hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">{event.title}</h3>
                      <p className="text-2xl font-bold text-primary">{event.year}</p>
                    </div>
                    <Badge variant="outline" className={`${getTypeColor(event.type)} text-white border-transparent`}>
                      {getTypeLabel(event.type)}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{event.description}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
