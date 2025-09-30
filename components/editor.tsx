"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Stage, Layer, Image as KonvaImage, Line, Rect, Group, Transformer } from "react-konva"
import useImage from "use-image"
import { Eraser, Image as ImageIcon, Upload, Sticker, MousePointerClick } from "lucide-react"

/** Types */
type BrushType = "normal" | "highlight" | "eraser"
type Tool = "mouse" | "draw" | "sticker"

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

type StickerItem = {
  id: string
  url: string
  x: number
  y: number
  scale: number
  rotation: number
}

/** Hooks & utils */
function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [size, setSize] = useState({ width: 800, height: 1200 })
  useEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver(() => {
      const w = ref.current!.clientWidth || 800
      setSize((s) => ({ ...s, width: w }))
    })
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])
  return { ref, size }
}

const readAsDataURL = (file: File) =>
  new Promise<string>((res, rej) => {
    const fr = new FileReader()
    fr.onload = () => res(String(fr.result))
    fr.onerror = rej
    fr.readAsDataURL(file)
  })

const makeId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

/** Component */
export function Editor() {
  const stageRef = useRef<any>(null)
  const { ref: containerRef, size } = useElementSize<HTMLDivElement>()
  const canvasWidth = size.width
  const canvasHeight = Math.round((canvasWidth * 3) / 2) // 2:3 dọc

    // 🆕 Thêm state để check màn hình nhỏ
  const [isSmall, setIsSmall] = useState(false)

  useEffect(() => {
    const check = () => setIsSmall(window.innerWidth < 768) // <768px coi như mobile
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])


  // Card area
  const cardPadding = 12
  const cardX = cardPadding
  const cardY = cardPadding
  const cardW = canvasWidth - cardPadding * 2
  const cardH = canvasHeight - cardPadding * 2
  const cornerRadius = 28

  const [tool, setTool] = useState<Tool>("mouse")

  const [showGuides, setShowGuides] = useState(true)

  // Frame (fixed overlay)
  const [frameUrl, setFrameUrl] = useState<string | null>(null)
  const [frameImg] = useImage(frameUrl || "", "anonymous")

  // Background image (movable with Mouse)
  const [bgUrl, setBgUrl] = useState<string | null>(null)
  const [bgImg] = useImage(bgUrl || "", "anonymous")
  const [bgTransform, setBgTransform] = useState({ x: 0, y: 0, scale: 1 })

  // Drawing (own layer so eraser only affects drawings)
  const [lines, setLines] = useState<DrawLine[]>([])
  const [redoStack, setRedoStack] = useState<DrawLine[]>([])
  const drawingRef = useRef(false)
  const [brush, setBrush] = useState<BrushType>("normal")
  const [color, setColor] = useState<string>("#00E5FF")
  const [thickness, setThickness] = useState<number>(12)
  const [opacity, setOpacity] = useState<number>(0.9)
  const palette = ["#00E5FF", "#7CFF00", "#FF00F5", "#FFD400", "#FF2D55", "#8A2BE2", "#ffffff", "#000000"]

  // Stickers (move/resize only when in Sticker tool)
  const [stickers, setStickers] = useState<StickerItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  /* ---------- SCALE HELPERS (ultra-small zoom for BG) ---------- */
  // BG: allow 0.1% .. 800%
  const bgScaleInfo = useMemo(() => {
    const MIN = 0.001, MAX = 8
    if (!bgImg) return { min: MIN, max: MAX, fit: 1, fill: 1 }
    const fit = Math.min(cardW / bgImg.width, cardH / bgImg.height) // contain
    const fill = Math.max(cardW / bgImg.width, cardH / bgImg.height) // cover
    return { min: MIN, max: MAX, fit, fill }
  }, [bgImg, cardW, cardH])

  const centerBgAtScale = useCallback(
    (s: number) => {
      if (!bgImg) return
      const scale = clamp(s, bgScaleInfo.min, bgScaleInfo.max)
      const w = bgImg.width * scale
      const h = bgImg.height * scale
      setBgTransform({ x: (cardW - w) / 2, y: (cardH - h) / 2, scale })
    },
    [bgImg, cardW, cardH, bgScaleInfo.min, bgScaleInfo.max],
  )

  /* ---------- Brush style ---------- */
  const makeStyle = useCallback(
    (): Omit<DrawLine, "id" | "points"> => {
      switch (brush) {
        case "eraser":
          return { stroke: "#000", strokeWidth: thickness, globalCompositeOperation: "destination-out", opacity: 1 }
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
          return { stroke: color, strokeWidth: thickness, globalCompositeOperation: "source-over", opacity }
      }
    },
    [brush, color, thickness, opacity],
  )

  /* ---------- Draw handlers ---------- */
  const startDrawing = useCallback(
    (pos: { x: number; y: number }) => {
      const style = makeStyle()
      setLines((prev) => [...prev, { id: makeId(), points: [pos.x, pos.y], ...style }])
      setRedoStack([])
    },
    [makeStyle],
  )

  const extendDrawing = useCallback((pos: { x: number; y: number }) => {
    setLines((prev) => {
      if (!prev.length) return prev
      const last = prev[prev.length - 1]
      const updated: DrawLine = { ...last, points: [...last.points, pos.x, pos.y] }
      return [...prev.slice(0, -1), updated]
    })
  }, [])

  const handlePointerDown = useCallback(
    (e: any) => {
      if (tool !== "draw") return
      const pos = e.target.getStage().getPointerPosition()
      if (!pos) return
      drawingRef.current = true
      startDrawing(pos)
    },
    [tool, startDrawing],
  )

  const handlePointerMove = useCallback(
    (e: any) => {
      if (tool !== "draw" || !drawingRef.current) return
      const p = e.target.getStage().getPointerPosition()
      if (!p) return
      extendDrawing(p)
    },
    [tool, extendDrawing],
  )

  const handlePointerUp = useCallback(() => {
    drawingRef.current = false
  }, [])

  const undo = useCallback(() => {
    setLines((prev) => {
      if (!prev.length) return prev
      const popped = prev[prev.length - 1]
      setRedoStack((r) => [...r, popped])
      return prev.slice(0, -1)
    })
  }, [])
  const redo = useCallback(() => {
    setRedoStack((rp) => {
      if (!rp.length) return rp
      const popped = rp[rp.length - 1]
      setLines((l) => [...l, popped])
      return rp.slice(0, -1)
    })
  }, [])

  /* ---------- Uploads (client-only) ---------- */
  const onUploadFrame = useCallback(async (f?: File) => {
    if (!f) return
    const url = await readAsDataURL(f)
    setFrameUrl(url)
    // frame fixed: auto fit & center to card area (no drag, no zoom)
    // --> rendered at (0,0) with width=cardW, height=cardH inside clip group
  }, [])

  const onUploadBg = useCallback(async (f?: File) => {
    if (!f) return
    const url = await readAsDataURL(f)
    setBgUrl(url)
    setTool("mouse") // dùng Mouse để căn ảnh
  }, [])

  // Khi bgImg vừa load, auto Fit & Center cho đẹp
  useEffect(() => {
    if (bgImg) {
      const fit = Math.min(cardW / bgImg.width, cardH / bgImg.height)
      centerBgAtScale(fit)
    }
  }, [bgImg, cardW, cardH, centerBgAtScale])

  const onUploadStickers = useCallback(
    async (files?: FileList | null) => {
      if (!files?.length) return
      const arr = await Promise.all([...files].map(readAsDataURL))
      const midX = cardW / 2
      const midY = cardH / 2
      setStickers((prev) => [
        ...prev,
        ...arr.map((url, i) => ({
          id: makeId(),
          url,
          x: midX + (i % 2 === 0 ? -60 : 60),
          y: midY + (i % 3 === 0 ? -60 : 60),
          scale: 0.6,
          rotation: 0,
        })),
      ])
    },
    [cardW, cardH],
  )

  /* ---------- Selection / keyboard ---------- */
  const isSelected = (id: string) => selectedId === id
  const deselect = () => setSelectedId(null)
  const onDeleteSelected = useCallback(() => {
    if (!selectedId) return
    setStickers((s) => s.filter((x) => x.id !== selectedId))
    setSelectedId(null)
  }, [selectedId])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") onDeleteSelected()
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") undo()
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") redo()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onDeleteSelected, undo, redo])

  /* ---------- Export (rounded, cropped) ---------- */
  const exportPNG = () => {
  if (!stageRef.current) return
  const prev = showGuides
  setShowGuides(false)               // ẩn guides
  requestAnimationFrame(() => {      // chờ re-render 1 frame
    const uri = stageRef.current.toDataURL({
      x: cardX,
      y: cardY,
      width: cardW,
      height: cardH,
      pixelRatio: Math.min(4, window.devicePixelRatio || 2),
      mimeType: "image/png",
    })
    const a = document.createElement("a")
    a.download = "photocard.png"
    a.href = uri
    a.click()
    setShowGuides(prev)              // bật lại guides
  })
}


  /* ---------- Cursor ---------- */
  const cursor = useMemo(() => {
    if (tool === "draw") return brush === "eraser" ? "cell" : "crosshair"
    return "default"
  }, [tool, brush])

  /* ---------- Selectable Sticker (draggable only in Sticker tool) ---------- */
  const SelectableSticker: React.FC<{ item: StickerItem }> = ({ item }) => {
    const [img] = useImage(item.url, "anonymous")
    const ref = useRef<any>(null)
    const trRef = useRef<any>(null)

    useEffect(() => {
      if (isSelected(item.id) && trRef.current && ref.current) {
        trRef.current.nodes([ref.current])
        trRef.current.getLayer().batchDraw()
      }
    }, [selectedId])

    return (
      <>
        <KonvaImage
          image={img || undefined}
          x={item.x}
          y={item.y}
          scaleX={item.scale}
          scaleY={item.scale}
          rotation={item.rotation}
          draggable={tool === "sticker"}
          onClick={() => tool === "sticker" && setSelectedId(item.id)}
          onTap={() => tool === "sticker" && setSelectedId(item.id)}
          ref={ref}
          onDragEnd={(e) => {
            const { x, y } = e.target.position()
            setStickers((prev) => prev.map((s) => (s.id === item.id ? { ...s, x, y } : s)))
          }}
          onTransformEnd={() => {
            const node = ref.current
            const scale = node.scaleX()
            const rotation = node.rotation()
            setStickers((prev) => prev.map((s) => (s.id === item.id ? { ...s, scale, rotation } : s)))
          }}
        />
        {tool === "sticker" && isSelected(item.id) && <Transformer ref={trRef} rotateEnabled={true} />}
      </>
    )
  }

  return (
    <div className="space-y-4">
      {/* 🆕 Responsive warning */}
      {isSmall && (
        <div className="bg-yellow-500/20 text-yellow-200 text-sm p-2 rounded-md border border-yellow-400 text-center">
          ⚠️ Trình chỉnh sửa này hoạt động tốt hơn trên iPad hoặc laptop.  
          Vui lòng dùng thiết bị màn hình lớn để trải nghiệm tốt nhất.
        </div>
      )}

      {/* Top bar – modern UI */}
      <div className="flex flex-wrap items-center gap-2 bg-gradient-to-r from-indigo-800/40 to-fuchsia-700/30 rounded-xl px-3 py-2 border border-indigo-600/40 shadow-lg">
        {/* Mouse tool (chỉ để kéo ảnh nền) */}
        <button
          className={`px-3 py-2 rounded-lg border transition-all ${tool === "mouse" ? "border-blue-400 bg-blue-500/20 shadow" : "border-slate-600 bg-slate-900/60"} text-white inline-flex items-center gap-2`}
          onClick={() => setTool("mouse")}
          title="Mouse — chỉ kéo ảnh nền"
        >
          <MousePointerClick className="w-4 h-4" /> Mouse
        </button>

        {/* Step 1: Frame (upload only, auto fit center) */}
        <div className="flex items-center gap-2 ml-2">
          <span className="text-sm text-gray-200">1) Frame:</span>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={(e) => onUploadFrame(e.target.files?.[0])} />
            <span className="px-3 py-2 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-700 text-white inline-flex items-center gap-2">
              <Upload className="w-4 h-4" /> Upload
            </span>
          </label>
          {frameImg && <span className="text-xs text-gray-400">Auto fit & center • Frame cố định</span>}
        </div>

        {/* Step 2: Background */}
        <div className="flex items-center gap-2 ml-4">
          <span className="text-sm text-gray-200">2) Ảnh:</span>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={(e) => onUploadBg(e.target.files?.[0])} />
            <span className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> Chọn ảnh
            </span>
          </label>
          {bgImg && (
            <>
              <span className="text-xs text-gray-200">Zoom</span>
              <input
  type="range"
  min={0.1}   // cho phép thu nhỏ còn 10% kích thước
  max={1}     // tối đa = 100% (giữ nguyên)
  step={0.01} // bước nhỏ, mượt hơn
  value={bgTransform.scale}
  onChange={(e) => {
    const s = Number(e.target.value)
    setBgTransform((t) => ({ ...t, scale: s }))
  }}
/>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => centerBgAtScale(bgScaleInfo.fit)}
                  className="px-2 py-1 rounded-md bg-slate-800 border border-slate-600 text-slate-100"
                >
                  Fit & Center
                </button>
                <button
                  onClick={() => centerBgAtScale(bgScaleInfo.fill)}
                  className="px-2 py-1 rounded-md bg-slate-800 border border-slate-600 text-slate-100"
                >
                  Fill & Center
                </button>
                <button
                  onClick={() => centerBgAtScale(1)}
                  className="px-2 py-1 rounded-md bg-slate-800 border border-slate-600 text-slate-100"
                >
                  1:1 & Center
                </button>
                <span className="text-xs text-gray-400">(kéo ảnh bằng Mouse)</span>
              </div>
            </>
          )}
        </div>

        {/* Export */}
        <button
          onClick={exportPNG}
          className="ml-auto px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-medium shadow"
        >
          ⬇️ Export PNG
        </button>
      </div>

      <div
        className="flex gap-0 rounded-2xl border-2 border-indigo-500/50 bg-slate-950/40 backdrop-blur"
        ref={containerRef}
      >
        {/* Canvas */}
        <div className="flex-1">
          <Stage
            width={canvasWidth}
            height={canvasHeight}
            ref={stageRef}
            onMouseDown={handlePointerDown}
            onTouchStart={handlePointerDown}
            onMouseMove={handlePointerMove}
            onTouchMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onTouchEnd={handlePointerUp}
            style={{ background: "#0b0f1a", cursor }}
            onClick={(e) => {
              if (e.target === e.target.getStage()) deselect()
            }}
          >
            {/* LAYER 0: guides (hiển thị trong editor) */}
            <Layer listening={false} visible={showGuides}>
              <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill="#0b0f1a" />
              <Rect
                x={cardX}
                y={cardY}
                width={cardW}
                height={cardH}
                cornerRadius={cornerRadius}
                stroke="#60a5fa66"
                strokeWidth={2}
              />
              <Rect
                x={cardX + 24}
                y={cardY + 24}
                width={cardW - 48}
                height={cardH - 48}
                cornerRadius={Math.max(8, cornerRadius - 12)}
                stroke="#22c55e66"
                dash={[8, 6]}
              />
            </Layer>

            {/* LAYER 1: background image (clipped, draggable via Mouse) */}
            <Layer>
              <Group
                x={cardX}
                y={cardY}
                clipFunc={(ctx) => {
                  const r = cornerRadius, w = cardW, h = cardH, x = 0, y = 0
                  ctx.beginPath()
                  ctx.moveTo(x + r, y)
                  ctx.arcTo(x + w, y, x + w, y + h, r)
                  ctx.arcTo(x + w, y + h, x, y + h, r)
                  ctx.arcTo(x, y + h, x, y, r)
                  ctx.arcTo(x, y, x + w, y, r)
                  ctx.closePath()
                }}
              >
                {bgImg && (
                  <KonvaImage
                    image={bgImg}
                    x={bgTransform.x}
                    y={bgTransform.y}
                    scaleX={bgTransform.scale}
                    scaleY={bgTransform.scale}
                    draggable={tool === "mouse"}
                    onDragEnd={(e) => {
                      const { x, y } = e.target.position()
                      setBgTransform((t) => ({ ...t, x, y }))
                    }}
                    width={bgImg.width}
                    height={bgImg.height}
                  />
                )}
              </Group>
            </Layer>

            {/* LAYER 2: drawing (clipped) */}
            <Layer listening={tool === "draw"}>
              <Group
                x={cardX}
                y={cardY}
                clipFunc={(ctx) => {
                  const r = cornerRadius, w = cardW, h = cardH, x = 0, y = 0
                  ctx.beginPath()
                  ctx.moveTo(x + r, y)
                  ctx.arcTo(x + w, y, x + w, y + h, r)
                  ctx.arcTo(x + w, y + h, x, y + h, r)
                  ctx.arcTo(x, y + h, x, y, r)
                  ctx.arcTo(x, y, x + w, y, r)
                  ctx.closePath()
                }}
              >
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
              </Group>
            </Layer>

            {/* LAYER 3: stickers (clipped, draggable only in Sticker tool) */}
            <Layer>
              <Group
                x={cardX}
                y={cardY}
                clipFunc={(ctx) => {
                  const r = cornerRadius, w = cardW, h = cardH, x = 0, y = 0
                  ctx.beginPath()
                  ctx.moveTo(x + r, y)
                  ctx.arcTo(x + w, y, x + w, y + h, r)
                  ctx.arcTo(x + w, y + h, x, y + h, r)
                  ctx.arcTo(x, y + h, x, y, r)
                  ctx.arcTo(x, y, x + w, y, r)
                  ctx.closePath()
                }}
              >
                {stickers.map((s) => (
                  <SelectableSticker key={s.id} item={s} />
                ))}
              </Group>
            </Layer>

            {/* LAYER 4: frame (clipped, fixed) */}
            <Layer listening={false}>
              <Group
                x={cardX}
                y={cardY}
                clipFunc={(ctx) => {
                  const r = cornerRadius, w = cardW, h = cardH, x = 0, y = 0
                  ctx.beginPath()
                  ctx.moveTo(x + r, y)
                  ctx.arcTo(x + w, y, x + w, y + h, r)
                  ctx.arcTo(x + w, y + h, x, y + h, r)
                  ctx.arcTo(x, y + h, x, y, r)
                  ctx.arcTo(x, y, x + w, y, r)
                  ctx.closePath()
                }}
              >
                {frameImg && (
                  <KonvaImage
                    image={frameImg}
                    x={0}
                    y={0}
                    width={cardW}
                    height={cardH}
                    listening={false} // không bắt sự kiện -> không kéo/zoom frame
                  />
                )}
              </Group>
            </Layer>
          </Stage>
        </div>

        {/* Sidebar – fixed width, no Mouse button here */}
        <aside className="w-[320px] flex-shrink-0 border-l border-indigo-500/40 bg-slate-900/70 p-4 flex flex-col gap-4">
          {/* Mode buttons (Draw / Sticker) */}
          <div className="grid grid-cols-2 gap-2">
            <button
              className={`px-2 py-2 rounded-lg border ${tool === "draw" ? "border-blue-400 bg-blue-500/20" : "border-slate-700 bg-slate-900"} text-white`}
              onClick={() => setTool("draw")}
              title="Draw"
            >
              ✏️ Draw
            </button>
            <button
              className={`px-2 py-2 rounded-lg border ${tool === "sticker" ? "border-blue-400 bg-blue-500/20" : "border-slate-700 bg-slate-900"} text-white`}
              onClick={() => setTool("sticker")}
              title="Sticker"
            >
              🖼️ Sticker
            </button>
          </div>

          {/* Draw controls */}
          {tool === "draw" && (
            <>
              <div className="flex items-center gap-2">
                {(["normal", "highlight", "eraser"] as BrushType[]).map((b) => (
                  <button
                    key={b}
                    onClick={() => setBrush(b)}
                    className={`px-3 py-1 rounded-md border ${brush === b ? "border-blue-400 bg-slate-800" : "border-slate-700 bg-slate-900"} text-white`}
                  >
                    {b === "eraser" ? (
                      <>
                        <Eraser className="w-4 h-4 inline-block mr-1" />
                        Eraser
                      </>
                    ) : b === "highlight" ? (
                      "✨ Neon"
                    ) : (
                      "● Pen"
                    )}
                  </button>
                ))}
              </div>
              <div>
                <p className="text-xs text-gray-300 mb-1">Màu nhanh</p>
                <div className="flex flex-wrap gap-2">
                  {palette.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className="h-7 w-7 rounded-full border-2"
                      style={{ background: c, borderColor: "#2563eb" }}
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
              <div className="flex gap-2">
                <button onClick={undo} className="px-3 py-1 rounded-md bg-blue-500 text-black">↶ Undo</button>
                <button onClick={redo} className="px-3 py-1 rounded-md bg-blue-500 text-black">↷ Redo</button>
              </div>
            </>
          )}

          {/* Sticker controls (upload only; drag/resize in Sticker tool) */}
          {tool === "sticker" && (
            <>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => onUploadStickers(e.target.files)}
                />
                <span className="px-3 py-2 rounded-lg bg-pink-600 hover:bg-pink-700 text-white inline-flex items-center gap-2">
                  <Upload className="w-4 h-4" /> Upload sticker
                </span>
              </label>
              <div className="text-xs text-gray-400 mt-2">
                Dùng tab <b>Sticker</b> để kéo/resize, nhấn <b>Delete</b> để xoá item đã chọn.
              </div>
            </>
          )}
        </aside>
      </div>

      <div className="text-xs text-gray-400 flex justify-between">
        <span>Flow: 1) Frame → 2) Ảnh → 3) Mouse/Draw/Sticker → 4) Export PNG</span>
        <span>Mouse: chỉ kéo ảnh nền • Draw: vẽ • Sticker: kéo/resize sticker</span>
      </div>
    </div>
  )
}
