"use client"

import { create } from "zustand"

export interface Song {
  id: number
  title: string
  artist: string
  duration: string
  album: string
  youtubeId: string
}

interface MusicPlayerState {
  currentSong: Song | null
  isPlaying: boolean
  playlist: Song[]
  currentIndex: number
  playSong: (song: Song) => void
  pauseSong: () => void
  nextSong: () => void
  previousSong: () => void
  setPlaylist: (songs: Song[]) => void
  setIsPlaying: (playing: boolean) => void
}

const defaultPlaylist: Song[] = [
  {
    id: 1,
    title: "Rơi Tự Do",
    artist: "Lyhan",
    duration: "3:45",
    album: "Single",
    youtubeId: "c7TLmvJQsB8",
  },
  {
    id: 2,
    title: "A NEW HARLEY QUINN",
    artist: "Lyhan",
    duration: "4:12",
    album: "Single",
    youtubeId: "BtNcCtN2n8c",
  },
  {
    id: 3,
    title: "Nhân Danh Tình Yêu",
    artist: "Lyhan",
    duration: "3:28",
    album: "Single",
    youtubeId: "n0J9WfZprXg",
  },
  {
    id: 4,
    title: "Welcome home",
    artist: "Lyhan",
    duration: "4:01",
    album: "Single",
    youtubeId: "Vr0Y-aft5n4",
  },
  {
    id: 5,
    title: "Tình Yêu Ngủ Quên",
    artist: "Hoàng Tôn ft. Lyhan",
    duration: "3:55",
    album: "Collab",
    youtubeId: "eukA1NGSM5w",
  },
  {
    id: 6,
    title: "Sao Cô Ấy Không Yêu Tôi",
    artist: "Freaky x Lyhan x CM1X",
    duration: "3:50",
    album: "Collab",
    youtubeId: "iQoNKnX5dG0",
  },
]

export const useMusicPlayer = create<MusicPlayerState>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  playlist: defaultPlaylist,
  currentIndex: -1,

  playSong: (song: Song) => {
    const { playlist } = get()
    const index = playlist.findIndex((s) => s.id === song.id)
    set({ currentSong: song, isPlaying: true, currentIndex: index })
  },

  pauseSong: () => set({ isPlaying: false }),

  nextSong: () => {
    const { playlist, currentIndex } = get()
    const nextIndex = (currentIndex + 1) % playlist.length
    const nextSong = playlist[nextIndex]
    set({ currentSong: nextSong, currentIndex: nextIndex, isPlaying: true })
  },

  previousSong: () => {
    const { playlist, currentIndex } = get()
    const prevIndex = currentIndex <= 0 ? playlist.length - 1 : currentIndex - 1
    const prevSong = playlist[prevIndex]
    set({ currentSong: prevSong, currentIndex: prevIndex, isPlaying: true })
  },

  setPlaylist: (songs: Song[]) => set({ playlist: songs }),

  // cho phép đồng bộ trạng thái khi user bấm Play/Pause trên khung YouTube
  setIsPlaying: (playing: boolean) => set({ isPlaying: playing }),
}))
