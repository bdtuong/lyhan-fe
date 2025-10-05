"use client"

import { useEffect, useRef, useState } from "react"
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
  const dragStateRef = useRef<any>(null)
  const SIZE_STEPS = isMobile ? MOBILE_SIZES : DESKTOP_SIZES
  const [sizeIndex, setSizeIndex] = useState<number>(() => {
    if (typeof window === "undefined") return 1
    const saved = Number(localStorage.getItem(SIZE_KEY))
    return Number.isFinite(saved)
      ? Math.min(Math.max(saved, 0), SIZE_STEPS.length - 1)
      : 1
  })

  const width = SIZE_STEPS[sizeIndex]
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<any>(null)
  const [ready, setReady] = useState(false)
  const embedId = currentSong?.youtubeId
  const title = currentSong?.title ?? "No song selected"

  const [autoNext, setAutoNext] = useState(true)

  useEffect(() => localStorage.setItem(VISIBLE_KEY, String(visible)), [visible])
  useEffect(() => localStorage.setItem(SIZE_KEY, String(sizeIndex)), [sizeIndex])
  useEffect(() => localStorage.setItem(POS_KEY, JSON.stringify(pos)), [pos])

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
              if (e.data === 0 && autoNext) nextSong()
            },
          },
        })
      } else if (embedId && playerRef.current.getVideoData().video_id !== embedId) {
        playerRef.current.loadVideoById(embedId)
      }
    })()

    return () => {
      mounted = false
    }
  }, [embedId, nextSong, setIsPlaying, autoNext])

  useEffect(() => {
    const player = playerRef.current
    if (!player || !ready) return
    try {
      isPlaying ? player.playVideo() : player.pauseVideo()
    } catch {}
  }, [isPlaying, ready])

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

  const playRandom = () => {
    const rand = playlist[Math.floor(Math.random() * playlist.length)]
    playSong(rand)
  }

  if (typeof window !== "undefined" && !width) {
    return (
      <div className="fixed bottom-4 right-4 z-[9999] text-xs text-white/50">
        Loading player...
      </div>
    )
  }

  return (
    <>
      {!visible && (
        <button
          onClick={() => setVisible(true)}
          className="fixed bottom-4 right-4 z-[9999] flex items-center gap-2 px-4 py-2.5
            rounded-full bg-white/10 backdrop-blur border border-white/20 text-white
            hover:bg-white/20 transition-all duration-200"
        >
          <Music className="w-4 h-4" />
          <span className="text-sm font-medium">Open Player</span>
        </button>
      )}

      <div
        ref={outerRef}
        className={`fixed z-[9999] transition-opacity ${visible ? "" : "opacity-0 pointer-events-none"}`}
        style={{
          left: pos.x,
          top: pos.y,
          width,
          maxWidth: isMobile ? "calc(100vw - 16px)" : "none",
        }}
      >
        <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl rounded-xl text-white w-full">
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base md:text-lg font-semibold truncate max-w-[220px]">
                  {title}
                </h3>
                <p className="text-xs text-white/60">
                  {currentSong?.artist ?? "No song selected"}
                </p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" disabled={sizeIndex <= 0} onClick={() => setSizeIndex(i => i - 1)} className="hover:bg-white/20">
                  <Minus className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" disabled={sizeIndex >= SIZE_STEPS.length - 1} onClick={() => setSizeIndex(i => i + 1)} className="hover:bg-white/20">
                  <Plus className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setVisible(false)} className="hover:bg-white/20">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="relative w-full pt-[56.25%] rounded-md overflow-hidden border border-white/10">
              {currentSong ? (
                <div ref={containerRef} className="absolute inset-0 w-full h-full" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-white/60">
                  No song selected
                </div>
              )}
            </div>

            <div className="flex justify-center items-center gap-4 flex-wrap">
              <Button variant="ghost" size="icon" onClick={previousSong} className="hover:bg-white/20 sm:w-10 sm:h-10 md:w-12 md:h-12">
                <SkipBack className="w-5 h-5" />
              </Button>
              {currentSong ? (
                <Button variant="ghost" size="icon" onClick={() => setIsPlaying(!isPlaying)} className="rounded-full bg-white/20 hover:bg-white/30 sm:w-10 sm:h-10 md:w-12 md:h-12">
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </Button>
              ) : (
                <Button variant="ghost" onClick={playRandom} className="gap-2 text-sm hover:bg-white/10 px-3 py-2">
                  <Shuffle className="w-4 h-4" /> Shuffle
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={nextSong} className="hover:bg-white/20 sm:w-10 sm:h-10 md:w-12 md:h-12">
                <SkipForward className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                onClick={() => setAutoNext(v => !v)}
                className="text-xs text-white/70 hover:bg-white/10 px-3 py-2"
              >
                {autoNext ? "Auto-Next: On" : "Auto-Next: Off"}
              </Button>
            </div>

            <p className="text-center text-xs text-white/50">
              Streaming from YouTube • Ads (if any) are inserted by YouTube.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
