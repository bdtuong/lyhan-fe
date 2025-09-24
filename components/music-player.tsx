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

// Responsive size steps - mobile friendly
const MOBILE_SIZES = [280, 320, 360] as const
const DESKTOP_SIZES = [320, 420, 560, 720] as const
const POS_KEY = "lyhan_mp_pos"
const SIZE_KEY = "lyhan_mp_size"
const VISIBLE_KEY = "lyhan_mp_visible"

type Pos = { x: number; y: number }

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  return isMobile
}

export function MusicPlayer() {
  const { currentSong, isPlaying, nextSong, previousSong, playlist, playSong, setIsPlaying } = useMusicPlayer()
  const isMobile = useIsMobile()

  // --- Visible (mặc định đóng) ---
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false
    const saved = localStorage.getItem(VISIBLE_KEY)
    return saved === "true" // Mặc định false nếu chưa có trong localStorage
  })

  // --- Drag state ---
  const outerRef = useRef<HTMLDivElement>(null)
  const handleRef = useRef<HTMLDivElement>(null)
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

  // --- Size / zoom với responsive ---
  const SIZE_STEPS = isMobile ? MOBILE_SIZES : DESKTOP_SIZES
  const [sizeIndex, setSizeIndex] = useState<number>(() => {
    if (typeof window === "undefined") return isMobile ? 1 : 1
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

  // Lưu trạng thái visible
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(VISIBLE_KEY, String(visible))
    }
  }, [visible])

  // Khởi tạo vị trí ban đầu với responsive
  useEffect(() => {
    if (typeof window === "undefined") return
    const saved = localStorage.getItem(POS_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Pos
        // Đảm bảo vị trí hợp lệ với kích thước hiện tại
        const estHeight = width * 9 / 16 + (isMobile ? 160 : 140)
        const maxX = Math.max(0, window.innerWidth - width)
        const maxY = Math.max(0, window.innerHeight - estHeight)
        setPos({
          x: Math.min(parsed.x, maxX),
          y: Math.min(parsed.y, maxY)
        })
        return
      } catch {}
    }
    
    // Vị trí mặc định
    const estHeight = width * 9 / 16 + (isMobile ? 160 : 140)
    if (isMobile) {
      // Mobile: đặt ở giữa màn hình
      setPos({
        x: Math.max(8, (window.innerWidth - width) / 2),
        y: Math.max(8, (window.innerHeight - estHeight) / 2)
      })
    } else {
      // Desktop: góc phải dưới
      setPos({
        x: Math.max(16, window.innerWidth - width - 16),
        y: Math.max(16, window.innerHeight - estHeight - 16)
      })
    }
  }, [width, isMobile])

  // Reset size index khi chuyển giữa mobile/desktop
  useEffect(() => {
    const maxIndex = SIZE_STEPS.length - 1
    if (sizeIndex > maxIndex) {
      setSizeIndex(maxIndex)
    }
  }, [SIZE_STEPS.length, sizeIndex])

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

  // --- Drag handlers với touch support ---
  useEffect(() => {
    const handleEl = handleRef.current
    if (!handleEl) return

    const getEventCoords = (e: PointerEvent | TouchEvent) => {
      if ('touches' in e) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY }
      }
      return { x: e.clientX, y: e.clientY }
    }

    const onStart = (e: PointerEvent | TouchEvent) => {
      e.preventDefault()
      if (!outerRef.current) return
      
      const coords = getEventCoords(e)
      const rect = outerRef.current.getBoundingClientRect()
      
      dragStateRef.current = {
        startX: coords.x,
        startY: coords.y,
        originX: rect.left,
        originY: rect.top,
        maxX: window.innerWidth - rect.width,
        maxY: window.innerHeight - rect.height,
        dragging: true
      }
      
      if ('setPointerCapture' in e.target!) {
        ;(e.target as Element).setPointerCapture((e as PointerEvent).pointerId)
      }
      
      document.body.style.userSelect = "none"
      document.body.style.cursor = "grabbing"
      document.body.style.touchAction = "none"
    }

    const onMove = (e: PointerEvent | TouchEvent) => {
      e.preventDefault()
      const st = dragStateRef.current
      if (!st?.dragging) return
      
      const coords = getEventCoords(e)
      const dx = coords.x - st.startX
      const dy = coords.y - st.startY
      const nextX = Math.min(Math.max(st.originX + dx, 8), st.maxX - 8)
      const nextY = Math.min(Math.max(st.originY + dy, 8), st.maxY - 8)
      setPos({ x: nextX, y: nextY })
    }

    const onEnd = (e: PointerEvent | TouchEvent) => {
      if (!dragStateRef.current?.dragging) return
      
      dragStateRef.current = null
      document.body.style.userSelect = ""
      document.body.style.cursor = ""
      document.body.style.touchAction = ""
      
      if ('releasePointerCapture' in e.target! && 'pointerId' in e) {
        ;(e.target as Element).releasePointerCapture((e as PointerEvent).pointerId)
      }
    }

    // Pointer events
    handleEl.addEventListener("pointerdown", onStart)
    document.addEventListener("pointermove", onMove)
    document.addEventListener("pointerup", onEnd)
    
    // Touch events for better mobile support
    handleEl.addEventListener("touchstart", onStart, { passive: false })
    document.addEventListener("touchmove", onMove, { passive: false })
    document.addEventListener("touchend", onEnd)

    return () => {
      handleEl.removeEventListener("pointerdown", onStart)
      document.removeEventListener("pointermove", onMove)
      document.removeEventListener("pointerup", onEnd)
      handleEl.removeEventListener("touchstart", onStart)
      document.removeEventListener("touchmove", onMove)
      document.removeEventListener("touchend", onEnd)
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
          className={`fixed z-[9999] rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-500 flex items-center gap-2 transition-all
            ${isMobile 
              ? 'bottom-4 right-4 px-3 h-12 text-sm' 
              : 'bottom-4 right-4 px-4 h-11'
            }`}
          aria-label="Mở trình phát"
        >
          <Music className="w-4 h-4" /> 
          {isMobile ? 'Player' : 'Mở player'}
        </button>
      )}

      <div
        ref={outerRef}
        className={`fixed z-[9999] transition-opacity ${
          visible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ 
          left: pos.x, 
          top: pos.y, 
          width,
          maxWidth: isMobile ? 'calc(100vw - 16px)' : 'none'
        }}
      >
        <Card className="border border-blue-500/20 bg-gradient-to-r from-[#050b1a]/95 to-[#0b2245]/95 text-white backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
          <CardContent className={isMobile ? "p-2" : "p-3 sm:p-4"}>
            {/* Header - Control Bar */}
            <div className={`flex items-center justify-between ${isMobile ? 'mb-2' : 'mb-3'}`}>
              <div
                ref={handleRef}
                className={`flex items-center gap-1 rounded-lg bg-blue-500/10 ring-1 ring-blue-500/30 cursor-grab active:cursor-grabbing select-none touch-none
                  ${isMobile ? 'px-1.5 py-1' : 'px-2 py-1'}`}
              >
                <Move className="w-4 h-4 text-blue-300" />
                {!isMobile && (
                  <span className="text-xs text-blue-200/80 hidden sm:block">Kéo để di chuyển</span>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={zoomOut}
                  disabled={!canZoomOut}
                  className={`bg-transparent border-blue-500/30 text-blue-200 hover:bg-blue-900/30 disabled:opacity-40
                    ${isMobile ? 'w-7 h-7' : 'w-9 h-9'}`}
                >
                  <Minus className={isMobile ? "w-3 h-3" : "w-4 h-4"} />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={zoomIn}
                  disabled={!canZoomIn}
                  className={`bg-transparent border-blue-500/30 text-blue-200 hover:bg-blue-900/30 disabled:opacity-40
                    ${isMobile ? 'w-7 h-7' : 'w-9 h-9'}`}
                >
                  <Plus className={isMobile ? "w-3 h-3" : "w-4 h-4"} />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setVisible(false)}
                  className={`bg-transparent border-blue-500/30 text-blue-200 hover:bg-blue-900/30
                    ${isMobile ? 'w-7 h-7' : 'w-9 h-9'}`}
                >
                  <X className={isMobile ? "w-3 h-3" : "w-4 h-4"} />
                </Button>
              </div>
            </div>

            {/* Song Info - Dedicated Row */}
            <div className={`text-center ${isMobile ? 'mb-2' : 'mb-3'}`}>
              <div className="min-h-0">
                <h3 className={`font-semibold leading-tight text-white break-words
                  ${isMobile ? 'text-sm line-clamp-2' : 'text-base line-clamp-2'}`}
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    wordBreak: 'break-word',
                    hyphens: 'auto'
                  }}
                  title={title}
                >
                  {title}
                </h3>
                <p className={`text-blue-200/70 mt-1 truncate
                  ${isMobile ? 'text-[11px]' : 'text-xs'}`}
                  title={currentSong ? currentSong.artist : "Chọn bài từ playlist hoặc phát ngẫu nhiên"}
                >
                  {currentSong ? currentSong.artist : "Chọn bài từ playlist hoặc phát ngẫu nhiên"}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className={`flex items-center justify-center gap-2 ${isMobile ? 'mb-2' : 'mb-3'}`}>
              <Button
                size="icon"
                variant="outline"
                onClick={previousSong}
                className={`p-0 bg-transparent border-blue-500/30 text-blue-200 hover:bg-blue-900/30
                  ${isMobile ? 'w-8 h-8' : 'w-9 h-9'}`}
                disabled={!currentSong}
              >
                <SkipBack className={isMobile ? "w-3 h-3" : "w-4 h-4"} />
              </Button>

              {currentSong ? (
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`p-0 bg-transparent border-blue-500/30 text-blue-100 hover:bg-blue-900/30
                    ${isMobile ? 'w-9 h-9' : 'w-10 h-10'}`}
                >
                  {isPlaying ? 
                    <Pause className={isMobile ? "w-4 h-4" : "w-5 h-5"} /> : 
                    <Play className={isMobile ? "w-4 h-4" : "w-5 h-5"} />
                  }
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={playRandom}
                  className={`bg-blue-600 hover:bg-blue-500 flex items-center gap-1
                    ${isMobile ? 'h-8 px-2 text-xs' : 'h-9'}`}
                >
                  <Shuffle className={isMobile ? "w-3 h-3" : "w-4 h-4"} /> 
                  {isMobile ? 'Random' : 'Ngẫu nhiên'}
                </Button>
              )}

              <Button
                size="icon"
                variant="outline"
                onClick={nextSong}
                className={`p-0 bg-transparent border-blue-500/30 text-blue-200 hover:bg-blue-900/30
                  ${isMobile ? 'w-8 h-8' : 'w-9 h-9'}`}
                disabled={!currentSong}
              >
                <SkipForward className={isMobile ? "w-3 h-3" : "w-4 h-4"} />
              </Button>
            </div>

            {/* Player area */}
            <div className={`relative w-full rounded-xl overflow-hidden ring-1 ring-blue-500/20
              ${isMobile ? 'rounded-lg' : 'rounded-xl'}`}>
              <div className="relative w-full pt-[56.25%]">
                {!currentSong ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-blue-200/80 p-4">
                    <p className={`text-center ${isMobile ? 'text-xs mb-2' : 'mb-2'}`}>
                      Chưa có bài nào được chọn
                    </p>
                    <Button 
                      onClick={playRandom} 
                      className={`bg-blue-600 hover:bg-blue-500 flex items-center gap-1
                        ${isMobile ? 'text-xs px-2 h-7' : ''}`}
                    >
                      <Shuffle className={isMobile ? "w-3 h-3" : "w-4 h-4"} /> 
                      Phát ngẫu nhiên
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

            <div className={`text-blue-200/60 text-center
              ${isMobile ? 'mt-2 text-[9px]' : 'mt-3 text-[11px]'}`}>
              Đang phát từ YouTube • quảng cáo (nếu có) vẫn do YouTube chèn.
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}