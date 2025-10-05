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
  visible: boolean
  playSong: (song: Song) => void
  pauseSong: () => void
  nextSong: () => void
  previousSong: () => void
  setPlaylist: (songs: Song[]) => void
  setIsPlaying: (playing: boolean) => void
  setVisible: (v: boolean) => void
}

const defaultPlaylist: Song[] = [
  {
    id: 1,
    title: "Rơi Tự Do",
    artist: "Lyhan",
    duration: "4:43",
    album: "Single",
    youtubeId: "c7TLmvJQsB8",
  },
  {
    id: 2,
    title: "A NEW HARLEY QUINN",
    artist: "Lyhan",
    duration: "2:44",
    album: "Single",
    youtubeId: "BtNcCtN2n8c",
  },
  {
    id: 3,
    title: "Nhân Danh Tình Yêu",
    artist: "Lyhan",
    duration: "2:58",
    album: "Single",
    youtubeId: "n0J9WfZprXg",
  },
  {
    id: 4,
    title: "Welcome home",
    artist: "Lyhan",
    duration: "3:39",
    album: "Single",
    youtubeId: "Vr0Y-aft5n4",
  },
  {
    id: 5,
    title: "Tình Yêu Ngủ Quên",
    artist: "Hoàng Tôn ft. Lyhan",
    duration: "3:23",
    album: "Collab",
    youtubeId: "eukA1NGSM5w",
  },
  {
    id: 6,
    title: "Sao Cô Ấy Không Yêu Tôi",
    artist: "Freaky x Lyhan x CM1X",
    duration: "3:41",
    album: "Collab",
    youtubeId: "iQoNKnX5dG0",
  },
  {
    id: 7,
    title: "Điều chưa nói (Piano version)",
    artist: "Lyhan",
    duration: "3:55",
    album: "Single",
    youtubeId: "elU6LJm7evc",
  },
  {
    id: 8,
    title: "AAA",
    artist: "Liên Quân 2",
    duration: "5:32",
    album: "Team",
    youtubeId: "zUJuVsSR5n4",
  },
  {
    id: 9,
    title: "Em chỉ là",
    artist: "Lyhan x Bích Phương x Hoàng Duyên x Muộii x Tăng Duy Tân",
    duration: "7:10",
    album: "Team",
    youtubeId: "Wh-lMGESBMs",
  },
  {
    id: 10,
    title: "Not My Fault",
    artist: "Lyhan x Mỹ Mỹ x Liu Grace x Maiquinn",
    duration: "5:37",
    album: "Team",
    youtubeId: "rO41XI57ySM",
  },
  {
    id: 11,
    title: "Lắm Lúc",
    artist: "Lyhan x Maiquinn x Tiên Tiên x Miu Lê x Bảo Anh",
    duration: "6:24",
    album: "Team",
    youtubeId: "DnVO61yDaYk",
  },
  {
    id: 12,
    title: "Tín Hiệu Yêu",
    artist: "Lyhan x Maiquinn x Tiên Tiên x Miu Lê x Bảo Anh",
    duration: "4:29",
    album: "Team",
    youtubeId: "KBtsCAxEdMk",
  },
  {
    id: 13,
    title: "Hourglass",
    artist: "Lyhan x Saabirose x Juky San x Châu Bùi",
    duration: "5:12",
    album: "Team",
    youtubeId: "d-XLNRV0pVg",
  },
]


export const useMusicPlayer = create<MusicPlayerState>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  playlist: defaultPlaylist,
  currentIndex: -1,
  visible: false, // 👈 thêm visible mặc định đóng

  playSong: (song: Song) => {
    const { playlist } = get()
    const index = playlist.findIndex((s) => s.id === song.id)
    set({
      currentSong: song,
      isPlaying: true,
      currentIndex: index,
      visible: true, // 👈 auto mở khi phát bài
    })
  },

  pauseSong: () => set({ isPlaying: false }),

  nextSong: () => {
    const { playlist, currentIndex } = get()
    const nextIndex = (currentIndex + 1) % playlist.length
    const nextSong = playlist[nextIndex]
    set({
      currentSong: nextSong,
      currentIndex: nextIndex,
      isPlaying: true,
      visible: true,
    })
  },

  previousSong: () => {
    const { playlist, currentIndex } = get()
    const prevIndex = currentIndex <= 0 ? playlist.length - 1 : currentIndex - 1
    const prevSong = playlist[prevIndex]
    set({
      currentSong: prevSong,
      currentIndex: prevIndex,
      isPlaying: true,
      visible: true,
    })
  },

  setPlaylist: (songs: Song[]) => set({ playlist: songs }),

  setIsPlaying: (playing: boolean) => set({ isPlaying: playing }),

  setVisible: (v: boolean) => set({ visible: v }),
}))
