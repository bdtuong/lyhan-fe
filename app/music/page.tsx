// import { MusicPlayer } from "@/components/music-player"
import { Playlist } from "@/components/playlist"

export default function MusicPage() {
  return (
    <div className="w-full min-h-screen text-white">
      <div className="px-4 sm:px-6 md:px-8 py-8 mt-16">
        <Playlist />
        {/* <MusicPlayer /> */}
      </div>
    </div>
  )
}

