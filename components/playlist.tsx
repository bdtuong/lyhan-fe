"use client"

import { Button } from "@/components/ui/button"
import { Play, Pause, Music } from "lucide-react"
import { useMusicPlayer } from "@/hooks/use-music-player"
import LiquidGlass from "@/components/ui/liquid-glass"
import { motion } from "framer-motion"

export function Playlist() {
  const { playlist, currentSong, isPlaying, playSong, pauseSong } = useMusicPlayer()

  const handlePlayPause = (song: typeof playlist[number]) => {
    if (currentSong?.id === song.id && isPlaying) pauseSong()
    else playSong(song)
  }

  return (
    <section className="relative w-full min-h-screen text-white px-4 pt-12 pb-24">
      <div className="max-w-3xl mx-auto space-y-6">
        <h2 className="text-4xl font-bold text-center mb-6">Playlist</h2>

        {playlist.map((song, i) => {
          const isCurrentSong = currentSong?.id === song.id
          const isCurrentlyPlaying = isCurrentSong && isPlaying
          const glassProps = !isCurrentlyPlaying ? { overLight: true } : {}

          return (
            <motion.div
              key={song.id}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.35, delay: i * 0.05, ease: "easeOut" }}
            >
              <LiquidGlass
                {...glassProps}
                className={`rounded-2xl p-4 transition-all duration-300 hover:scale-[1.02] ${
                  isCurrentlyPlaying ? "ring-2 ring-white/15" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-700">
                    {song.youtubeId ? (
                      <img
                        src={`https://img.youtube.com/vi/${song.youtubeId}/mqdefault.jpg`}
                        alt={song.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="w-6 h-6 text-zinc-400" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold truncate ${isCurrentlyPlaying ? "text-blue-400" : "text-white"}`}>
                      {song.title}
                    </h3>
                    <p className="text-sm text-zinc-400 truncate">
                      {song.artist} • {song.album}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-zinc-400">{song.duration}</span>
                    <Button
                      onClick={() => handlePlayPause(song)}
                      size="icon"
                      className="bg-white hover:bg-white/50 text-black"
                    >
                      {isCurrentlyPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </LiquidGlass>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
