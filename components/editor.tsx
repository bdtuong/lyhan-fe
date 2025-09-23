"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Stage, Layer, Image as KonvaImage, Line } from "react-konva"
import useImage from "use-image"
import { uploadImage } from "@/services/upload.services"

type BrushType = "normal" | "highlight" | "pencil" | "eraser"

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

  const [brush, setBrush] = useState<BrushType>("normal")
  const [color, setColor] = useState<string>("#00E5FF")
  const [thickness, setThickness] = useState<number>(12)

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

  // build style for each brush
  const makeStyle = useCallback((): Omit<DrawLine, "id" | "points"> => {
    switch (brush) {
      case "eraser":
        return {
          stroke: "#000",
          strokeWidth: thickness,
          shadowBlur: 0,
          globalCompositeOperation: "destination-out",
          opacity: 1
        }
      case "highlight": // neon glow
        return {
          stroke: color,
          strokeWidth: thickness,
          shadowBlur: Math.max(12, Math.round(thickness * 1.6)),
          shadowColor: color,
          globalCompositeOperation: "lighter",
          opacity: 1
        }
      case "pencil": // bút chì: mờ nhẹ, chồng nét đậm dần
        return {
          stroke: color || "#4b4b4b",
          strokeWidth: thickness <= 6 ? thickness : Math.round(thickness * 0.6),
          shadowBlur: 0,
          globalCompositeOperation: "multiply",
          opacity: 0.6
        }
      default: // normal
        return {
          stroke: color,
          strokeWidth: thickness,
          shadowBlur: 0,
          globalCompositeOperation: "source-over",
          opacity: 1
        }
    }
  }, [brush, color, thickness])

  const startDrawing = useCallback((pos: { x: number; y: number }) => {
    const style = makeStyle()
    setLines((prev) => [...prev, { id: String(Date.now()), points: [pos.x, pos.y], ...style }])
    setRedo([]) // bắt đầu nét mới thì xóa lịch sử redo
  }, [makeStyle])

  const extendDrawing = useCallback((pos: { x: number; y: number }) => {
    setLines((prev) => {
      if (prev.length === 0) return prev
      const last = prev[prev.length - 1]
      const updated: DrawLine = { ...last, points: [...last.points, pos.x, pos.y] }
      return [...prev.slice(0, -1), updated]
    })
  }, [])

  const handlePointerDown = useCallback((e: any) => {
    const pos = e.target.getStage().getPointerPosition()
    if (!pos) return
    drawingRef.current = true
    startDrawing(pos)
  }, [startDrawing])

  const handlePointerMove = useCallback((e: any) => {
    if (!drawingRef.current) return
    const stage = e.target.getStage()
    const point = stage.getPointerPosition()
    if (!point) return
    extendDrawing(point)
  }, [extendDrawing])

  const handlePointerUp = useCallback(() => {
    drawingRef.current = false
  }, [])

  // Undo/Redo + hotkeys
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
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault()
        if (e.shiftKey) redoAction()
        else undo()
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault()
        redoAction()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [undo, redoAction])

  const handleExport = useCallback(() => {
    if (!stageRef.current) return
    const uri = stageRef.current.toDataURL({ pixelRatio: Math.min(3, window.devicePixelRatio || 2) })
    const link = document.createElement("a")
    link.download = "my-edit.png"
    link.href = uri
    link.click()
  }, [])

  const cursor = useMemo(() => (brush === "eraser" ? "cell" : "crosshair"), [brush])

  const neonPalette = ["#00E5FF", "#7CFF00", "#FF00F5", "#FFD400", "#FF2D55", "#8A2BE2"]

  const brushLabel = useMemo(() => {
    switch (brush) {
      case "normal": return "Normal"
      case "highlight": return "Neon"
      case "pencil": return "Pencil"
      case "eraser": return "Eraser"
    }
  }, [brush])

  return (
    <div className="space-y-4">
      {/* toolbar: nền xanh chữ đen */}
      <div className="flex flex-wrap gap-3 items-center">
        <label className="px-3 py-1 rounded border bg-blue-500 text-black cursor-pointer hover:bg-blue-600">
          Chọn tệp
          <input type="file" accept="image/*" onChange={handleUploadBg} className="hidden" />
        </label>

        {/* brush group */}
        <div className="flex items-center gap-1">
          <button className={`px-3 py-1 rounded border bg-blue-500 text-black hover:bg-blue-600 ${brush === "normal" ? "ring-2 ring-blue-700" : ""}`} onClick={() => setBrush("normal")}>✏️ Normal</button>
          <button className={`px-3 py-1 rounded border bg-blue-500 text-black hover:bg-blue-600 ${brush === "highlight" ? "ring-2 ring-blue-700" : ""}`} onClick={() => setBrush("highlight")}>✨ Neon</button>
          <button className={`px-3 py-1 rounded border bg-blue-500 text-black hover:bg-blue-600 ${brush === "pencil" ? "ring-2 ring-blue-700" : ""}`} onClick={() => setBrush("pencil")}>✒️ Pencil</button>
          <button className={`px-3 py-1 rounded border bg-blue-500 text-black hover:bg-blue-600 ${brush === "eraser" ? "ring-2 ring-blue-700" : ""}`} onClick={() => setBrush("eraser")}>🧽 Eraser</button>
        </div>

        {/* active brush badge */}
        <span className="px-2 py-1 rounded border bg-blue-500 text-black text-sm">
          Đang chọn: <b>{brushLabel}</b>
        </span>

        {/* color & thickness */}
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-8 w-10 p-0 border rounded bg-blue-500"
            title="Chọn màu"
          />
          <div className="flex items-center gap-1">
            {neonPalette.map((c) => (
              <button
                key={c}
                aria-label={c}
                onClick={() => setColor(c)}
                className="h-6 w-6 rounded-full border hover:scale-105 transition"
                style={{ background: c }}
                title={c}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 ml-2">
            <span className="text-sm text-gray-300">Độ dày</span>
            <input
              type="range"
              min={2}
              max={60}
              step={1}
              value={thickness}
              onChange={(e) => setThickness(Number(e.target.value))}
            />
            <span className="text-sm tabular-nums w-8 text-center text-gray-200">{thickness}</span>
          </div>
        </div>

        {/* undo/redo & export */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            className={`px-3 py-1 rounded border bg-blue-500 text-black hover:bg-blue-600 disabled:opacity-50`}
            onClick={undo}
            disabled={lines.length === 0}
            title="Undo (Ctrl+Z)"
          >
            ↶ Undo
          </button>
          <button
            className={`px-3 py-1 rounded border bg-blue-500 text-black hover:bg-blue-600 disabled:opacity-50`}
            onClick={redoAction}
            disabled={redo.length === 0}
            title="Redo (Ctrl+Y / Ctrl+Shift+Z)"
          >
            ↷ Redo
          </button>
          <button
            className="px-3 py-1 rounded border bg-blue-500 text-black hover:bg-blue-600"
            onClick={handleExport}
          >
            ⬇️ Export
          </button>
        </div>
      </div>

      {/* canvas wrapper: nền đen, viền xanh dương */}
      <div
        ref={containerRef}
        className="w-full rounded border-2"
        style={{ borderColor: "#2563eb" }}
      >
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
          {/* Layer nền */}
          <Layer listening={false}>
            {bgImage && (
              <KonvaImage
                image={bgImage}
                width={size.width}
                height={size.height}
              />
            )}
          </Layer>

          {/* Layer nét vẽ */}
          <Layer listening={true}>
            {lines.map((line) => (
              <Line
                key={line.id}
                points={line.points}
                stroke={line.stroke}
                strokeWidth={line.strokeWidth}
                lineCap="round"
                lineJoin="round"
                tension={0.4}
                shadowBlur={line.shadowBlur || 0}
                shadowColor={line.shadowColor}
                globalCompositeOperation={line.globalCompositeOperation as any}
                perfectDrawEnabled={false}
                hitStrokeWidth={Math.max(8, line.strokeWidth + 6)}
                opacity={line.opacity ?? 1}
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  )
}
