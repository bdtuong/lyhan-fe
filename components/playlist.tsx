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

  // Group mỗi 5 bài thành một cột (chỉ dùng cho desktop)
  const grouped = []
  for (let i = 0; i < playlist.length; i += 5) {
    grouped.push(playlist.slice(i, i + 5))
  }

  return (
    <section className="relative w-full min-h-screen bg-black text-white">
      <h2 className="text-3xl font-bold text-center py-8">Playlist</h2>

      <div className="px-4">
        {/* Desktop: scroll ngang từng cột, căn giữa, hạn chế trống 2 bên */}
        <div className="hidden sm:flex gap-6 overflow-x-auto snap-x scroll-smooth justify-center px-8 scrollbar-thin scrollbar-thumb-white/10">
          {grouped.map((group, colIndex) => (
            <div
              key={colIndex}
              className="flex flex-col gap-6 min-w-[380px] max-w-[400px] snap-start"
            >
              {group.map((song, i) => {
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
                          <span className="text-sm text-zinc-400 hidden sm:block">{song.duration}</span>
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
          ))}
        </div>

        {/* Mobile: không chia cột, để thả dọc toàn bộ */}
        <div className="flex flex-col gap-6 sm:hidden">
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

                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold truncate ${isCurrentlyPlaying ? "text-blue-400" : "text-white"}`}>
                        {song.title}
                      </h3>
                      <p className="text-sm text-zinc-400 truncate">
                        {song.artist} • {song.album}
                      </p>
                    </div>

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
      </div>
    </section>
  )
}
