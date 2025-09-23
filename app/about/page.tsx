import { ArtistProfile } from "@/components/artist-profile"
import { ArtistStats } from "@/components/artist-stats"
import { ArtistTimeline } from "@/components/artist-timeline"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About</h1>
          <p className="text-muted-foreground text-lg">Get to know the artist behind the music</p>
        </div>

        <ArtistProfile />
        <ArtistStats />
        <ArtistTimeline />
      </div>
    </div>
  )
}
