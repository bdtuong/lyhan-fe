"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Stage, Layer, Image as KonvaImage, Line } from "react-konva"
import useImage from "use-image"
import { uploadImage } from "@/services/upload.services"
import { Eraser, Image as ImageIcon } from "lucide-react"

type BrushType = "normal" | "highlight" | "eraser"

type DrawLine = {
  id: string
  points: number[]
  stroke: string
  strokeWidth: number
  shadowBlur?: number
  shadowColor?: string
  globalCompositeOperation?: string
  opacity?: number
}

/* ---------- small util hooks ---------- */
function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [size, setSize] = useState({ width: 800, height: 600 })
  useEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver(() => {
      const w = ref.current!.clientWidth || 800
      setSize((s) => ({ ...s, width: w }))
    })
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])
  return { ref, size, setSize }
}

/* ---------- Editor ---------- */
export function Editor() {
  const stageRef = useRef<any>(null)
  const prevBgUrlRef = useRef<string | null>(null)
  const { ref: containerRef, size, setSize } = useElementSize<HTMLDivElement>()

  const [bgUrl, setBgUrl] = useState<string | null>(null)
  const [bgImage] = useImage(bgUrl || "", "anonymous")

  // drawing
  const [lines, setLines] = useState<DrawLine[]>([])
  const [redo, setRedo] = useState<DrawLine[]>([])
  const drawingRef = useRef(false)

  // brush & style
  const [brush, setBrush] = useState<BrushType>("normal")
  const [color, setColor] = useState<string>("#00E5FF")
  const [thickness, setThickness] = useState<number>(12)
  const [opacity, setOpacity] = useState<number>(0.9)

  // responsive height by bg aspect
  useEffect(() => {
    if (!bgImage) return
    const aspect = bgImage.height / bgImage.width || 0.75
    setSize((s) => ({ width: s.width, height: Math.round(s.width * aspect) }))
  }, [bgImage, setSize])

  // clear strokes when bg changes
  useEffect(() => {
    if (prevBgUrlRef.current && prevBgUrlRef.current !== bgUrl) {
      setLines([])
      setRedo([])
    }
    prevBgUrlRef.current = bgUrl
  }, [bgUrl])

  /* ---------- handlers ---------- */
  const handleUploadBg = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const { url } = await uploadImage(file)
    setBgUrl(url)
  }, [])

  // style theo cọ
  const makeStyle = useCallback((): Omit<DrawLine, "id" | "points"> => {
    switch (brush) {
      case "eraser":
        return {
          stroke: "#000",
          strokeWidth: thickness,
          globalCompositeOperation: "destination-out",
          opacity: 1,
        }
      case "highlight":
        return {
          stroke: color,
          strokeWidth: thickness,
          shadowBlur: Math.max(12, Math.round(thickness * 1.6)),
          shadowColor: color,
          globalCompositeOperation: "lighter",
          opacity,
        }
      default:
        return {
          stroke: color,
          strokeWidth: thickness,
          globalCompositeOperation: "source-over",
          opacity,
        }
    }
  }, [brush, color, thickness, opacity])

  const startDrawing = useCallback(
    (pos: { x: number; y: number }) => {
      const style = makeStyle()
      setLines((prev) => [...prev, { id: String(Date.now()), points: [pos.x, pos.y], ...style }])
      setRedo([])
    },
    [makeStyle],
  )

  const extendDrawing = useCallback((pos: { x: number; y: number }) => {
    setLines((prev) => {
      if (prev.length === 0) return prev
      const last = prev[prev.length - 1]
      const pts = last.points
      const updated: DrawLine = { ...last, points: [...pts, pos.x, pos.y] }
      return [...prev.slice(0, -1), updated]
    })
  }, [])

  const handlePointerDown = useCallback(
    (e: any) => {
      const pos = e.target.getStage().getPointerPosition()
      if (!pos) return
      drawingRef.current = true
      startDrawing(pos)
    },
    [startDrawing],
  )

  const handlePointerMove = useCallback(
    (e: any) => {
      if (!drawingRef.current) return
      const stage = e.target.getStage()
      const point = stage.getPointerPosition()
      if (!point) return
      extendDrawing(point)
    },
    [extendDrawing],
  )

  const handlePointerUp = useCallback(() => {
    drawingRef.current = false
  }, [])

  // Undo/Redo
  const undo = useCallback(() => {
    setLines((prev) => {
      if (prev.length === 0) return prev
      const popped = prev[prev.length - 1]
      setRedo((r) => [...r, popped])
      return prev.slice(0, -1)
    })
  }, [])
  const redoAction = useCallback(() => {
    setRedo((rprev) => {
      if (rprev.length === 0) return rprev
      const popped = rprev[rprev.length - 1]
      setLines((l) => [...l, popped])
      return rprev.slice(0, -1)
    })
  }, [])

  const handleExport = useCallback(() => {
    if (!stageRef.current) return
    const uri = stageRef.current.toDataURL({ pixelRatio: Math.min(3, window.devicePixelRatio || 2) })
    const link = document.createElement("a")
    link.download = "my-edit.png"
    link.href = uri
    link.click()
  }, [])

  const cursor = useMemo(() => (brush === "eraser" ? "cell" : "crosshair"), [brush])

  const palette = ["#00E5FF", "#7CFF00", "#FF00F5", "#FFD400", "#FF2D55", "#8A2BE2"]

  return (
    <div className="space-y-4">
      {/* Thanh trên cùng */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={undo}
            disabled={lines.length === 0}
            className="px-3 py-1 rounded bg-blue-500 text-black disabled:opacity-50"
          >
            ↶ Hoàn tác
          </button>
          <button
            onClick={redoAction}
            disabled={redo.length === 0}
            className="px-3 py-1 rounded bg-blue-500 text-black disabled:opacity-50"
          >
            ↷ Làm lại
          </button>
          <button
            onClick={handleExport}
            className="px-3 py-1 rounded bg-green-500 text-black hover:bg-green-600"
          >
            ⬇️ Tải ảnh
          </button>
        </div>
      </div>

      {/* Canvas + Sidebar */}
      <div className="w-full rounded border-2 border-blue-500" ref={containerRef}>
        <div className="flex flex-col md:flex-row">
          {/* Canvas */}
          <div className="flex-1 relative">
            <Stage
              width={size.width}
              height={size.height}
              ref={stageRef}
              onMouseDown={handlePointerDown}
              onTouchStart={handlePointerDown}
              onMouseMove={handlePointerMove}
              onTouchMove={handlePointerMove}
              onMouseUp={handlePointerUp}
              onTouchEnd={handlePointerUp}
              style={{ background: "#000", cursor }}
            >
              <Layer listening={false}>
                {bgImage && <KonvaImage image={bgImage} width={size.width} height={size.height} />}
              </Layer>
              <Layer listening={true}>
                {lines.map((line) => (
                  <Line
                    key={line.id}
                    points={line.points}
                    stroke={line.stroke}
                    strokeWidth={line.strokeWidth}
                    lineCap="round"
                    lineJoin="round"
                    tension={0.25}
                    shadowBlur={line.shadowBlur || 0}
                    shadowColor={line.shadowColor}
                    globalCompositeOperation={line.globalCompositeOperation as any}
                    hitStrokeWidth={Math.max(8, line.strokeWidth + 6)}
                    opacity={line.opacity ?? 1}
                  />
                ))}
              </Layer>
            </Stage>

            {/* Nút chọn ảnh giữa canvas */}
            {!bgImage && (
              <label className="absolute inset-0 flex items-center justify-center cursor-pointer">
                <div className="flex flex-col items-center gap-2 px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                  <ImageIcon className="w-6 h-6" />
                  <span>Chọn ảnh nền</span>
                </div>
                <input type="file" accept="image/*" onChange={handleUploadBg} className="hidden" />
              </label>
            )}
          </div>

          {/* Sidebar */}
          <aside className="md:w-[220px] w-full border-t md:border-t-0 md:border-l border-blue-700 bg-gray-900 p-4 flex flex-col gap-4">
            {/* Brushes */}
            <div className="flex md:flex-col gap-3 items-center md:items-start">
              {([
                { key: "normal", label: "Bình thường", icon: "●" },
                { key: "highlight", label: "Neon", icon: "✨" },
                { key: "eraser", label: "Tẩy", icon: <Eraser className="w-5 h-5" /> },
              ] as { key: BrushType; label: string; icon: React.ReactNode }[]).map((b) => (
                <button
                  key={b.key}
                  onClick={() => setBrush(b.key)}
                  title={b.label}
                  className={[
                    "h-10 w-10 rounded-full border-2 flex items-center justify-center",
                    "bg-black text-white hover:scale-105 transition",
                    brush === b.key
                      ? "border-blue-400 shadow-[0_0_0_3px_rgba(37,99,235,0.35)]"
                      : "border-gray-600",
                  ].join(" ")}
                >
                  {b.icon}
                </button>
              ))}
            </div>

            {/* Colors */}
            <div>
              <p className="text-xs text-gray-300 mb-2">Màu nhanh</p>
              <div className="flex flex-wrap gap-2">
                {palette.map((c) => (
                  <button
                    key={c}
                    aria-label={c}
                    onClick={() => setColor(c)}
                    className="h-7 w-7 rounded-full border-2"
                    style={{ background: c, borderColor: "#2563eb" }}
                    title={c}
                  />
                ))}
                <label className="h-7 w-7 rounded-full border-2 border-blue-700 bg-black flex items-center justify-center cursor-pointer">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="absolute opacity-0 w-0 h-0"
                  />
                  🎨
                </label>
              </div>
            </div>

            {/* Thickness */}
            <div>
              <div className="flex items-center justify-between text-xs text-gray-300">
                <span>Độ dày</span>
                <span>{thickness}px</span>
              </div>
              <input
                type="range"
                min={2}
                max={60}
                step={1}
                value={thickness}
                onChange={(e) => setThickness(Number(e.target.value))}
              />
            </div>

            {/* Opacity */}
            <div>
              <div className="flex items-center justify-between text-xs text-gray-300">
                <span>Độ trong</span>
                <span>{Math.round(opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
