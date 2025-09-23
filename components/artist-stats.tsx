import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Play, Heart, Download } from "lucide-react"

const stats = [
  {
    icon: Play,
    label: "Total Streams",
    value: "2.8B",
    description: "Across all platforms",
    color: "text-green-500",
  },
  {
    icon: Heart,
    label: "Monthly Listeners",
    value: "45M",
    description: "Active monthly listeners",
    color: "text-red-500",
  },
  {
    icon: Download,
    label: "Albums Sold",
    value: "12M",
    description: "Physical and digital sales",
    color: "text-blue-500",
  },
  {
    icon: TrendingUp,
    label: "Chart Positions",
    value: "#1",
    description: "Peak position achieved",
    color: "text-yellow-500",
  },
]

export function ArtistStats() {
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-6 text-center">By the Numbers</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-3xl font-bold text-primary">{stat.value}</h3>
                  <p className="font-medium">{stat.label}</p>
                  <p className="text-sm text-muted-foreground">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
