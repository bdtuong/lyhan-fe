"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, Music, Search, Sparkles } from "lucide-react"
import { useMusicPlayer } from "@/hooks/use-music-player"
import { recommendSong, type RecommendationResult } from "@/utils/songRecommender"

export function Playlist() {
  const { playlist, currentSong, isPlaying, playSong, pauseSong } = useMusicPlayer()
  const [userInput, setUserInput] = useState("")
  const [rec, setRec] = useState<RecommendationResult | null>(null)

  const handlePlayPause = (song: typeof playlist[number]) => {
    if (currentSong?.id === song.id && isPlaying) pauseSong()
    else playSong(song)
  }

  const handleRecommend = () => {
    if (!userInput.trim()) return
    const result = recommendSong(userInput.trim())
    setRec(result)
  }

  const playRecommended = () => {
    if (!rec?.song) return
    const matched = playlist.find((s) => s.youtubeId === rec.song!.youtubeId)
    if (matched) playSong(matched)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Playlist</h2>

      {/* Ô nhập cảm xúc / câu hỏi */}
      <Card className="p-4 border border-blue-500/20 bg-gradient-to-r from-black to-[#0a0f1f]">
        <h3 className="font-medium mb-2 text-blue-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Gợi ý theo cảm xúc của bạn
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Ví dụ: mình thấy cô đơn / bài nào hot nhất / giới thiệu về Lyhan..."
            className="flex-1 rounded-md border border-blue-500/50 bg-black px-3 py-2 text-sm text-blue-400 placeholder:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button onClick={handleRecommend} className="bg-blue-600 hover:bg-blue-500">
            <Search className="w-4 h-4 mr-1" />
            Gợi ý
          </Button>
        </div>

        {rec && (
          <div className="mt-3 text-sm">
            <p className="text-blue-100 leading-relaxed">{rec.message}</p>

            {rec.song && (
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span className="text-blue-300">
                  → Đề cử: <span className="font-semibold text-blue-200">{rec.song.title}</span>
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={playRecommended}
                  className="h-8 px-3 border-blue-500/50 text-blue-200 hover:bg-blue-900/30"
                >
                  <Play className="w-4 h-4 mr-1" /> Phát gợi ý
                </Button>
                <a
                  href={`https://www.youtube.com/watch?v=${rec.song.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline text-blue-300 hover:text-blue-200"
                >
                  Mở trên YouTube
                </a>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Danh sách bài hát */}
      <div className="space-y-3">
        {playlist.map((song) => {
          const isCurrentSong = currentSong?.id === song.id
          const isCurrentlyPlaying = isCurrentSong && isPlaying

          return (
            <Card
              key={song.id}
              className={`transition-all duration-200 hover:shadow-md ${
                isCurrentSong ? "ring-2 ring-primary bg-primary/5" : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-muted rounded-lg">
                      <Music
                        className={`w-6 h-6 ${
                          isCurrentSong ? "text-primary animate-pulse" : "text-muted-foreground"
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium truncate ${isCurrentSong ? "text-primary" : ""}`}>
                        {song.title}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {song.artist} • {song.album}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-muted-foreground hidden sm:block">
                      {song.duration}
                    </span>

                    <Button
                      size="sm"
                      variant={isCurrentSong ? "default" : "outline"}
                      onClick={() => handlePlayPause(song)}
                      className="w-10 h-10 p-0"
                    >
                      {isCurrentlyPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
