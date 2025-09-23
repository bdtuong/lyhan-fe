// import { MusicPlayer } from "@/components/music-player"
import { Playlist } from "@/components/playlist"

export default function MusicPage() {
  return (
    <div className="container mx-auto px-4 py-8 mt-24">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Music</h1>
          <p className="text-muted-foreground text-lg">Discover the latest tracks and fan favorites</p>
        </div>

        <div className="space-y-8">
          <Playlist />
          {/* <MusicPlayer /> */}
        </div>
      </div>
    </div>
  )
}
