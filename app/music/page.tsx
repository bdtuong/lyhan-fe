// import { MusicPlayer } from "@/components/music-player"
import { Playlist } from "@/components/playlist"

export default function MusicPage() {
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">🎶 Góc Âm Nhạc 🎶</h1>
            <p className="text-lg text-pink-200">
              Cùng lắng nghe những bài hát hay nhất của Lyhan nhaaa 💕✨
            </p>
          </div>

          <div className="space-y-8">
            <Playlist />
            {/* <MusicPlayer /> */}
          </div>
        </div>
      </div>
    </div>
  )
}
