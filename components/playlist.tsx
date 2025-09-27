"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, Music } from "lucide-react"
import { useMusicPlayer } from "@/hooks/use-music-player"

export function Playlist() {
  const { playlist, currentSong, isPlaying, playSong, pauseSong } = useMusicPlayer()

  const handlePlayPause = (song: typeof playlist[number]) => {
    if (currentSong?.id === song.id && isPlaying) pauseSong()
    else playSong(song)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-white">Playlist</h2>

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
                <div className="flex items-center justify-between gap-4">
                  {/* Thumbnail */}
                  <div className="relative w-16 h-12 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                    {song.youtubeId ? (
                      <img
                        src={`https://img.youtube.com/vi/${song.youtubeId}/mqdefault.jpg`}
                        alt={song.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Thông tin bài hát */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium truncate ${isCurrentSong ? "text-primary" : ""}`}>
                      {song.title}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {song.artist} • {song.album}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-muted-foreground hidden sm:block">
                      {song.duration}
                    </span>

                    <Button
                      onClick={() => handlePlayPause(song)}
                      className={isCurrentlyPlaying ? "bg-blue-600 hover:bg-blue-500" : "bg-blue-200 hover:bg-blue-300 text-blue-900"}
                      size="icon"
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
