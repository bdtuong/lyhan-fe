"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Play, Pause, SkipBack, SkipForward, Music, Shuffle,
  X, Minus, Plus, Move
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

// Nấc kích thước theo chiều rộng (px). Chiều cao auto theo 16:9.
const SIZE_STEPS = [320, 420, 560, 720] as const
const POS_KEY = "lyhan_mp_pos"
const SIZE_KEY = "lyhan_mp_size"

type Pos = { x: number; y: number }

export function MusicPlayer() {
  const { currentSong, isPlaying, nextSong, previousSong, playlist, playSong, setIsPlaying } = useMusicPlayer()

  // --- Visible (tắt/mở) ---
  const [visible, setVisible] = useState(true)

  // --- Drag state ---
  const outerRef = useRef<HTMLDivElement>(null)
  const handleRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<Pos>({ x: 24, y: 24 })
  const dragStateRef = useRef<{
    startX: number
    startY: number
    originX: number
    originY: number
    maxX: number
    maxY: number
    dragging: boolean
  } | null>(null)

  // --- Size / zoom ---
  const [sizeIndex, setSizeIndex] = useState<number>(() => {
    if (typeof window === "undefined") return 1
    const saved = Number(localStorage.getItem(SIZE_KEY))
    return Number.isFinite(saved) ? Math.min(Math.max(saved, 0), SIZE_STEPS.length - 1) : 1
  })
  const width = SIZE_STEPS[sizeIndex]
  const canZoomOut = sizeIndex > 0
  const canZoomIn = sizeIndex < SIZE_STEPS.length - 1

  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<any>(null)
  const [ready, setReady] = useState(false)
  const embedId = currentSong?.youtubeId
  const title = currentSong?.title ?? "Chưa chọn bài hát"

  // Khởi tạo vị trí ban đầu
  useEffect(() => {
    if (typeof window === "undefined") return
    const saved = localStorage.getItem(POS_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Pos
        setPos(parsed)
        return
      } catch {}
    }
    const estHeight = width * 9 / 16 + 120
    setPos({
      x: Math.max(16, window.innerWidth - width - 16),
      y: Math.max(16, window.innerHeight - estHeight - 16)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Lưu size khi đổi
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(SIZE_KEY, String(sizeIndex))
    }
  }, [sizeIndex])

  // Lưu pos khi đổi
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(POS_KEY, JSON.stringify(pos))
    }
  }, [pos])

  // Tạo/cập nhật YouTube player
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
            controls: 1
          },
          events: {
            onReady: () => {
              setReady(true)
              setIsPlaying(true)
            },
            onStateChange: (e: any) => {
              if (e.data === 1) setIsPlaying(true)
              if (e.data === 0) nextSong()
            }
          }
        })
      } else if (embedId) {
        playerRef.current.loadVideoById(embedId)
      }
    })()
    return () => { mounted = false }
  }, [embedId, nextSong, setIsPlaying])

  // Đồng bộ play/pause
  useEffect(() => {
    const player = playerRef.current
    if (!player || !ready) return
    try {
      if (isPlaying) player.playVideo()
      else player.pauseVideo()
    } catch {}
  }, [isPlaying, ready])

  // Thumbnail fallback
  const thumbSrc = useMemo(
    () => (embedId ? `https://img.youtube.com/vi/${embedId}/maxresdefault.jpg` : ""),
    [embedId]
  )

  const playRandom = () => {
    const rand = playlist[Math.floor(Math.random() * playlist.length)]
    playSong(rand)
  }

  // --- Drag handlers ---
  useEffect(() => {
    const handleEl = handleRef.current
    if (!handleEl) return

    const onPointerDown = (e: PointerEvent) => {
      if (!outerRef.current) return
      const rect = outerRef.current.getBoundingClientRect()
      dragStateRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        originX: rect.left,
        originY: rect.top,
        maxX: window.innerWidth - rect.width,
        maxY: window.innerHeight - rect.height,
        dragging: true
      };
      (e.target as Element).setPointerCapture?.(e.pointerId)
      window.addEventListener("pointermove", onPointerMove)
      window.addEventListener("pointerup", onPointerUp)
      document.body.style.userSelect = "none"
      document.body.style.cursor = "grabbing"
    }

    const onPointerMove = (e: PointerEvent) => {
      const st = dragStateRef.current
      if (!st?.dragging) return
      const dx = e.clientX - st.startX
      const dy = e.clientY - st.startY
      const nextX = Math.min(Math.max(st.originX + dx, 0), st.maxX)
      const nextY = Math.min(Math.max(st.originY + dy, 0), st.maxY)
      setPos({ x: nextX, y: nextY })
    }

    const onPointerUp = (e: PointerEvent) => {
      dragStateRef.current = null
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerup", onPointerUp)
      document.body.style.userSelect = ""
      document.body.style.cursor = ""
      ;(e.target as Element).releasePointerCapture?.(e.pointerId)
    }

    handleEl.addEventListener("pointerdown", onPointerDown)
    return () => {
      handleEl.removeEventListener("pointerdown", onPointerDown)
    }
  }, [])

  // --- Zoom ---
  const zoomIn = () => setSizeIndex((i) => Math.min(i + 1, SIZE_STEPS.length - 1))
  const zoomOut = () => setSizeIndex((i) => Math.max(i - 1, 0))

  // --- Render ---
  return (
    <>
      {!visible && (
        <button
          onClick={() => setVisible(true)}
          className="fixed bottom-4 right-4 z-[9999] rounded-full bg-blue-600 text-white px-4 h-11 shadow-lg hover:bg-blue-500 flex items-center gap-2"
          aria-label="Mở trình phát"
        >
          <Music className="w-4 h-4" /> Mở player
        </button>
      )}

      <div
        ref={outerRef}
        className={`fixed z-[9999] transition-opacity ${
          visible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ left: pos.x, top: pos.y, width }}
      >
        <Card className="border border-blue-500/20 bg-gradient-to-r from-[#050b1a]/95 to-[#0b2245]/95 text-white backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
          <CardContent className="p-3 sm:p-4">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
              <div
                ref={handleRef}
                className="flex items-center gap-2 px-2 py-1 rounded-lg bg-blue-500/10 ring-1 ring-blue-500/30 cursor-grab active:cursor-grabbing select-none"
              >
                <Move className="w-4 h-4 text-blue-300" />
                <span className="text-xs text-blue-200/80 hidden sm:block">Kéo để di chuyển</span>
              </div>
              <div className="min-w-0 ml-1">
                <h3 className="font-semibold leading-tight truncate max-w-[220px] sm:max-w-[360px]">
                  {title}
                </h3>
                <p className="text-xs text-blue-200/70 truncate">
                  {currentSong ? currentSong.artist : "Chọn bài từ playlist hoặc phát ngẫu nhiên"}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={zoomOut}
                  disabled={!canZoomOut}
                  className="w-9 h-9 bg-transparent border-blue-500/30 text-blue-200 hover:bg-blue-900/30 disabled:opacity-40"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={zoomIn}
                  disabled={!canZoomIn}
                  className="w-9 h-9 bg-transparent border-blue-500/30 text-blue-200 hover:bg-blue-900/30 disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setVisible(false)}
                  className="w-9 h-9 bg-transparent border-blue-500/30 text-blue-200 hover:bg-blue-900/30"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-end gap-2 mb-3">
              <Button
                size="icon"
                variant="outline"
                onClick={previousSong}
                className="w-9 h-9 p-0 bg-transparent border-blue-500/30 text-blue-200 hover:bg-blue-900/30"
                disabled={!currentSong}
              >
                <SkipBack className="w-4 h-4" />
              </Button>

              {currentSong ? (
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 p-0 bg-transparent border-blue-500/30 text-blue-100 hover:bg-blue-900/30"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={playRandom}
                  className="bg-blue-600 hover:bg-blue-500 h-9"
                >
                  <Shuffle className="w-4 h-4 mr-1" /> Ngẫu nhiên
                </Button>
              )}

              <Button
                size="icon"
                variant="outline"
                onClick={nextSong}
                className="w-9 h-9 p-0 bg-transparent border-blue-500/30 text-blue-200 hover:bg-blue-900/30"
                disabled={!currentSong}
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>

            {/* Player area */}
            <div className="relative w-full rounded-xl overflow-hidden ring-1 ring-blue-500/20">
              <div className="relative w-full pt-[56.25%]">
                {!currentSong ? (
                  <div className="absolute inset-0 flex items-center justify-center text-blue-200/80">
                    <p className="mb-2">Chưa có bài nào được chọn</p>
                    <Button onClick={playRandom} className="bg-blue-600 hover:bg-blue-500">
                      <Shuffle className="w-4 h-4 mr-2" /> Phát ngẫu nhiên
                    </Button>
                  </div>
                ) : (
                  <>
                    {!!thumbSrc && (
                      <img
                        src={thumbSrc}
                        alt="Video Thumbnail"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}
                    <div ref={containerRef} className="absolute inset-0 w-full h-full" id="yt-player" />
                  </>
                )}
              </div>
            </div>

            <div className="mt-3 text-[11px] text-blue-200/60">
              Đang phát từ YouTube • quảng cáo (nếu có) vẫn do YouTube chèn.
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
