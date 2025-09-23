import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Music, Award, Users, Globe } from "lucide-react"

export function ArtistProfile() {
  return (
    <section>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="md:flex">
            {/* Artist Image */}
            <div className="md:w-1/2 h-64 md:h-auto bg-muted">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage: `url('/artist-professional-portrait.jpg')`,
                }}
              />
            </div>

            {/* Artist Info */}
            <div className="md:w-1/2 p-8 space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Featured Artist</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary">Singer-Songwriter</Badge>
                  <Badge variant="secondary">Pop</Badge>
                  <Badge variant="secondary">Indie</Badge>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                A passionate musician who has been captivating audiences worldwide with heartfelt lyrics and memorable
                melodies. Known for blending contemporary pop with indie sensibilities, creating a unique sound that
                resonates with fans across generations.
              </p>

              <p className="text-muted-foreground leading-relaxed">
                With multiple chart-topping albums and sold-out tours, this artist continues to push creative boundaries
                while staying true to their authentic voice. Their music explores themes of love, growth, and the human
                experience, connecting deeply with listeners around the globe.
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Music className="w-4 h-4 text-primary" />
                  <span>5 Studio Albums</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Award className="w-4 h-4 text-primary" />
                  <span>12 Music Awards</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-primary" />
                  <span>10M+ Fans</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4 text-primary" />
                  <span>50+ Countries</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
