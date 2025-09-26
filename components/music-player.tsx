"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Play, Pause, SkipBack, SkipForward, Music, Shuffle,
  X, Minus, Plus
} from "lucide-react"
import { useMusicPlayer } from "@/hooks/use-music-player"

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady?: () => void
  }
}

function loadYouTubeApi(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve()
    if (window.YT && window.YT.Player) return resolve()
    const script = document.createElement("script")
    script.src = "https://www.youtube.com/iframe_api"
    document.body.appendChild(script)
    window.onYouTubeIframeAPIReady = () => resolve()
  })
}

const MOBILE_SIZES = [280, 320, 360] as const
const DESKTOP_SIZES = [320, 420, 560, 720] as const
const POS_KEY = "lyhan_mp_pos"
const SIZE_KEY = "lyhan_mp_size"
const VISIBLE_KEY = "lyhan_mp_visible"

type Pos = { x: number; y: number }

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])
  return isMobile
}

export function MusicPlayer() {
  const {
    currentSong,
    isPlaying,
    nextSong,
    previousSong,
    playlist,
    playSong,
    setIsPlaying,
    visible,
    setVisible,
  } = useMusicPlayer()

  const isMobile = useIsMobile()
  const outerRef = useRef<HTMLDivElement>(null)

  const [pos, setPos] = useState<Pos>({ x: 16, y: 16 })
  const dragStateRef = useRef<{
    startX: number
    startY: number
    originX: number
    originY: number
    maxX: number
    maxY: number
    dragging: boolean
  } | null>(null)

  const SIZE_STEPS = isMobile ? MOBILE_SIZES : DESKTOP_SIZES
  const [sizeIndex, setSizeIndex] = useState<number>(() => {
    if (typeof window === "undefined") return 1
    const saved = Number(localStorage.getItem(SIZE_KEY))
    return Number.isFinite(saved)
      ? Math.min(Math.max(saved, 0), SIZE_STEPS.length - 1)
      : 1
  })

  const width = SIZE_STEPS[sizeIndex]
  const canZoomOut = sizeIndex > 0
  const canZoomIn = sizeIndex < SIZE_STEPS.length - 1

  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<any>(null)
  const [ready, setReady] = useState(false)
  const embedId = currentSong?.youtubeId
  const title = currentSong?.title ?? "Chưa chọn bài hát"

  // Save state
  useEffect(() => localStorage.setItem(VISIBLE_KEY, String(visible)), [visible])
  useEffect(() => localStorage.setItem(SIZE_KEY, String(sizeIndex)), [sizeIndex])
  useEffect(() => localStorage.setItem(POS_KEY, JSON.stringify(pos)), [pos])

  // YouTube
  useEffect(() => {
    if (!containerRef.current) return
    let mounted = true
    ;(async () => {
      await loadYouTubeApi()
      if (!mounted) return
      if (!playerRef.current) {
        playerRef.current = new window.YT.Player(containerRef.current, {
          videoId: embedId,
          playerVars: {
            autoplay: 1,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            controls: 1,
          },
          events: {
            onReady: () => {
              setReady(true)
              setIsPlaying(true)
            },
            onStateChange: (e: any) => {
              if (e.data === 1) setIsPlaying(true)
              if (e.data === 0) nextSong()
            },
          },
        })
      } else if (embedId) {
        playerRef.current.loadVideoById(embedId)
      }
    })()
    return () => {
      mounted = false
    }
  }, [embedId, nextSong, setIsPlaying])

  useEffect(() => {
    const player = playerRef.current
    if (!player || !ready) return
    try {
      isPlaying ? player.playVideo() : player.pauseVideo()
    } catch {}
  }, [isPlaying, ready])

  // Drag toàn bộ player
  useEffect(() => {
    const dragEl = outerRef.current
    if (!dragEl) return

    const getCoords = (e: PointerEvent | TouchEvent) =>
      "touches" in e
        ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
        : { x: e.clientX, y: e.clientY }

    const onStart = (e: PointerEvent | TouchEvent) => {
      const coords = getCoords(e)
      const rect = dragEl.getBoundingClientRect()
      dragStateRef.current = {
        startX: coords.x,
        startY: coords.y,
        originX: rect.left,
        originY: rect.top,
        maxX: window.innerWidth - rect.width,
        maxY: window.innerHeight - rect.height,
        dragging: true,
      }
      document.body.style.userSelect = "none"
      document.body.style.cursor = "grabbing"
    }

    const onMove = (e: PointerEvent | TouchEvent) => {
      const st = dragStateRef.current
      if (!st?.dragging) return
      if (!("touches" in e)) e.preventDefault()
      const coords = getCoords(e)
      const dx = coords.x - st.startX
      const dy = coords.y - st.startY
      setPos({
        x: Math.min(Math.max(st.originX + dx, 8), st.maxX - 8),
        y: Math.min(Math.max(st.originY + dy, 8), st.maxY - 8),
      })
    }

    const onEnd = () => {
      if (!dragStateRef.current?.dragging) return
      dragStateRef.current = null
      document.body.style.userSelect = ""
      document.body.style.cursor = ""
    }

    dragEl.addEventListener("pointerdown", onStart)
    document.addEventListener("pointermove", onMove)
    document.addEventListener("pointerup", onEnd)
    dragEl.addEventListener("touchstart", onStart, { passive: true })
    document.addEventListener("touchmove", onMove, { passive: true })
    document.addEventListener("touchend", onEnd)

    return () => {
      dragEl.removeEventListener("pointerdown", onStart)
      document.removeEventListener("pointermove", onMove)
      document.removeEventListener("pointerup", onEnd)
      dragEl.removeEventListener("touchstart", onStart)
      document.removeEventListener("touchmove", onMove)
      document.removeEventListener("touchend", onEnd)
    }
  }, [])

  const thumbSrc = useMemo(
    () =>
      embedId
        ? `https://img.youtube.com/vi/${embedId}/maxresdefault.jpg`
        : "",
    [embedId]
  )

  const playRandom = () => {
    const rand = playlist[Math.floor(Math.random() * playlist.length)]
    playSong(rand)
  }

  // Render
  return (
    <>
      {!visible && (
        <button
          onClick={() => setVisible(true)}
          className="fixed bottom-4 right-4 z-[9999] px-4 h-11 bg-blue-600 text-white rounded-full shadow-lg flex items-center gap-2 hover:bg-blue-500"
        >
          <Music className="w-4 h-4" /> {isMobile ? "Player" : "Mở player"}
        </button>
      )}

      <div
        ref={outerRef}
        className={`fixed z-[9999] transition-opacity ${
          visible ? "" : "opacity-0 pointer-events-none"
        }`}
        style={{
          left: pos.x,
          top: pos.y,
          width,
          maxWidth: isMobile ? "calc(100vw - 16px)" : "none",
        }}
      >
        <Card className="border border-blue-500/20 bg-gradient-to-r from-[#050b1a]/95 to-[#0b2245]/95 text-white backdrop-blur-md shadow-lg">
          <CardContent className="p-3">
            {/* Header */}
            <div className="flex justify-end items-center mb-3">
              <div className="flex gap-1">
                <Button
                  disabled={!canZoomOut}
                  onClick={() => setSizeIndex((i) => i - 1)}
                >
                  <Minus />
                </Button>
                <Button
                  disabled={!canZoomIn}
                  onClick={() => setSizeIndex((i) => i + 1)}
                >
                  <Plus />
                </Button>
                <Button onClick={() => setVisible(false)}>
                  <X />
                </Button>
              </div>
            </div>

            {/* Info */}
            <div className="text-center mb-3">
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-blue-200/70">
                {currentSong?.artist ?? "Chọn bài hát"}
              </p>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-2 mb-3">
              <Button onClick={previousSong}>
                <SkipBack />
              </Button>
              {currentSong ? (
                <Button onClick={() => setIsPlaying(!isPlaying)}>
                  {isPlaying ? <Pause /> : <Play />}
                </Button>
              ) : (
                <Button onClick={playRandom}>
                  <Shuffle /> Ngẫu nhiên
                </Button>
              )}
              <Button onClick={nextSong}>
                <SkipForward />
              </Button>
            </div>

            {/* Player */}
            <div className="relative w-full pt-[56.25%] rounded overflow-hidden ring-1 ring-blue-500/20">
              {currentSong ? (
                <div
                  ref={containerRef}
                  className="absolute inset-0 w-full h-full"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-blue-200">
                  Chưa có bài nào
                </div>
              )}
            </div>

            <p className="text-center text-xs text-blue-200/60 mt-3">
              Đang phát từ YouTube • quảng cáo (nếu có) vẫn do YouTube chèn.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
