"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Line,
  Rect,
  Group,
  Transformer,
} from "react-konva";
import useImage from "use-image";
import {
  Eraser,
  Image as ImageIcon,
  Upload,
  MousePointerClick,
} from "lucide-react";
import { Pencil, Sticker, Download } from "lucide-react";

/** Types */
type BrushType = "normal" | "highlight" | "eraser";
type Tool = "mouse" | "draw" | "sticker";

type DrawLine = {
  id: string;
  points: number[];
  stroke: string;
  strokeWidth: number;
  shadowBlur?: number;
  shadowColor?: string;
  globalCompositeOperation?: string;
  opacity?: number;
};

type StickerItem = {
  id: string;
  url: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
};

/** Hooks & utils */
function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 800, height: 1200 });
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(() => {
      const w = ref.current!.clientWidth || 800;
      setSize((s) => ({ ...s, width: w }));
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return { ref, size };
}

const readAsDataURL = (file: File) =>
  new Promise<string>((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(String(fr.result));
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });

const makeId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

/** SelectableSticker */
const SelectableSticker: React.FC<{
  item: StickerItem;
  selected: boolean;
  tool: Tool;
  onSelect: (id: string) => void;
  onChange: (s: StickerItem) => void;
}> = ({ item, selected, tool, onSelect, onChange }) => {
  const [img] = useImage(item.url, "anonymous");
  const ref = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (selected && trRef.current && ref.current) {
      trRef.current.nodes([ref.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [selected]);

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
        onClick={() => tool === "sticker" && onSelect(item.id)}
        onTap={() => tool === "sticker" && onSelect(item.id)}
        ref={ref}
        onDragEnd={(e) => {
          const { x, y } = e.target.position();
          onChange({ ...item, x, y });
        }}
        onTransformEnd={() => {
          const node = ref.current;
          const scale = node.scaleX();
          const rotation = node.rotation();
          onChange({ ...item, scale, rotation });
        }}
      />
      {tool === "sticker" && selected && (
        <Transformer ref={trRef} rotateEnabled={true} />
      )}
    </>
  );
};

/** Component */
export function Editor() {
  const stageRef = useRef<any>(null);
  const { ref: containerRef, size } = useElementSize<HTMLDivElement>();
  const canvasWidth = size.width;
  const canvasHeight = Math.round((canvasWidth * 3) / 2); // 2:3 portrait

  // Layout: card area with padding & rounded corner (cropped)
  const pad = 12;
  const cardX = pad;
  const cardY = pad;
  const cardW = canvasWidth - pad * 2;
  const cardH = canvasHeight - pad * 2;
  const cornerRadius = 28;

  // Responsive note for very small screens
  const [isSmall, setIsSmall] = useState(false);
  useEffect(() => {
    const check = () => setIsSmall(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Tools & UI
  const [tool, setTool] = useState<Tool>("mouse");
  const [showGuides, setShowGuides] = useState(true);

  // Frame (fixed overlay)
  const [frameUrl, setFrameUrl] = useState<string | null>(null);
  const [frameImg] = useImage(frameUrl || "", "anonymous");

  // Background (draggable by Mouse tool)
  const [bgUrl, setBgUrl] = useState<string | null>(null);
  const [bgImg] = useImage(bgUrl || "", "anonymous");
  const [bgTransform, setBgTransform] = useState({ x: 0, y: 0, scale: 1 });

  // Drawing
  const [lines, setLines] = useState<DrawLine[]>([]);
  const [redoStack, setRedoStack] = useState<DrawLine[]>([]);
  const drawingRef = useRef(false);
  const [brush, setBrush] = useState<BrushType>("normal");
  const [color, setColor] = useState<string>("#ffffff"); // trắng mặc định trên nền đen
  const [thickness, setThickness] = useState<number>(8);
  const [opacity, setOpacity] = useState<number>(1);
  const palette = ["#ffffff", "#e5e5e5", "#bfbfbf", "#8a8a8a", "#000000"];

  // Stickers
  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  /* ---------- BG scale helpers ---------- */
  const bgScaleInfo = useMemo(() => {
    const MIN = 0.1,
      MAX = 8;
    if (!bgImg) return { min: MIN, max: MAX, fit: 1, fill: 1 };
    const fit = Math.min(cardW / bgImg.width, cardH / bgImg.height);
    const fill = Math.max(cardW / bgImg.width, cardH / bgImg.height);
    return { min: MIN, max: MAX, fit, fill };
  }, [bgImg, cardW, cardH]);

  const centerBgAtScale = useCallback(
    (s: number) => {
      if (!bgImg) return;
      const scale = clamp(s, bgScaleInfo.min, bgScaleInfo.max);
      const w = bgImg.width * scale;
      const h = bgImg.height * scale;
      setBgTransform({ x: (cardW - w) / 2, y: (cardH - h) / 2, scale });
    },
    [bgImg, cardW, cardH, bgScaleInfo.min, bgScaleInfo.max]
  );

  /* ---------- Brush style ---------- */
  const makeStyle = useCallback(
    (): Omit<DrawLine, "id" | "points"> => {
      switch (brush) {
        case "eraser":
          return {
            stroke: "#000000",
            strokeWidth: thickness,
            globalCompositeOperation: "destination-out",
            opacity: 1,
          };
        case "highlight":
          return {
            stroke: color,
            strokeWidth: thickness,
            shadowBlur: Math.max(10, Math.round(thickness * 1.2)),
            shadowColor: color,
            globalCompositeOperation: "lighter",
            opacity,
          };
        default:
          return {
            stroke: color,
            strokeWidth: thickness,
            globalCompositeOperation: "source-over",
            opacity,
          };
      }
    },
    [brush, color, thickness, opacity]
  );

  /* ---------- Draw handlers (FIX OFFSET) ---------- */
  const startDrawing = useCallback(
    (pos: { x: number; y: number }) => {
      const style = makeStyle();
      setLines((prev) => [
        ...prev,
        { id: makeId(), points: [pos.x, pos.y], ...style },
      ]);
      setRedoStack([]);
    },
    [makeStyle]
  );

  const extendDrawing = useCallback((pos: { x: number; y: number }) => {
    setLines((prev) => {
      if (!prev.length) return prev;
      const last = prev[prev.length - 1];
      const updated: DrawLine = {
        ...last,
        points: [...last.points, pos.x, pos.y],
      };
      return [...prev.slice(0, -1), updated];
    });
  }, []);

  const handlePointerDown = useCallback(
    (e: any) => {
      if (tool !== "draw") return;
      const pos = e.target.getStage().getPointerPosition();
      if (!pos) return;
      // ✅ FIX: trừ cardX/cardY để vẽ trong Group (0,0)
      const adj = { x: pos.x - cardX, y: pos.y - cardY };
      drawingRef.current = true;
      startDrawing(adj);
    },
    [tool, startDrawing, cardX, cardY]
  );

  const handlePointerMove = useCallback(
    (e: any) => {
      if (tool !== "draw" || !drawingRef.current) return;
      const p = e.target.getStage().getPointerPosition();
      if (!p) return;
      // ✅ FIX: trừ cardX/cardY để vẽ trong Group (0,0)
      const adj = { x: p.x - cardX, y: p.y - cardY };
      extendDrawing(adj);
    },
    [tool, extendDrawing, cardX, cardY]
  );

  const handlePointerUp = useCallback(() => {
    drawingRef.current = false;
  }, []);

  const undo = useCallback(() => {
    setLines((prev) => {
      if (!prev.length) return prev;
      const popped = prev[prev.length - 1];
      setRedoStack((r) => [...r, popped]);
      return prev.slice(0, -1);
    });
  }, []);
  const redo = useCallback(() => {
    setRedoStack((rp) => {
      if (!rp.length) return rp;
      const popped = rp[rp.length - 1];
      setLines((l) => [...l, popped]);
      return rp.slice(0, -1);
    });
  }, []);

  /* ---------- Uploads (client-only) ---------- */
  const onUploadFrame = useCallback(async (f?: File) => {
    if (!f) return;
    const url = await readAsDataURL(f);
    setFrameUrl(url);
  }, []);

  const onUploadBg = useCallback(async (f?: File) => {
    if (!f) return;
    const url = await readAsDataURL(f);
    setBgUrl(url);
    setTool("mouse"); // dùng Mouse để căn ảnh
  }, []);

  useEffect(() => {
    if (bgImg) {
      const fit = Math.min(cardW / bgImg.width, cardH / bgImg.height);
      centerBgAtScale(fit);
    }
  }, [bgImg, cardW, cardH, centerBgAtScale]);

  const onUploadStickers = useCallback(
    async (files?: FileList | null) => {
      if (!files?.length) return;
      const arr = await Promise.all([...files].map(readAsDataURL));
      const midX = cardW / 2;
      const midY = cardH / 2;
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
      ]);
    },
    [cardW, cardH]
  );

  /* ---------- Selection / keyboard ---------- */
  const isSelected = (id: string) => selectedId === id;
  const deselect = () => setSelectedId(null);
  const onDeleteSelected = useCallback(() => {
    if (!selectedId) return;
    setStickers((s) => s.filter((x) => x.id !== selectedId));
    setSelectedId(null);
  }, [selectedId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") onDeleteSelected();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") undo();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") redo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDeleteSelected, undo, redo]);

  /* ---------- Export (cropped to rounded card) ---------- */
  const exportPNG = () => {
    if (!stageRef.current) return;
    const prev = showGuides;
    setShowGuides(false);
    requestAnimationFrame(() => {
      const uri = stageRef.current.toDataURL({
        x: cardX,
        y: cardY,
        width: cardW,
        height: cardH,
        pixelRatio: Math.min(4, window.devicePixelRatio || 2),
        mimeType: "image/png",
      });
      const a = document.createElement("a");
      a.download = "photocard.png";
      a.href = uri;
      a.click();
      setShowGuides(prev);
    });
  };

  /* ---------- Cursor ---------- */
  const cursor = useMemo(() => {
    if (tool === "draw") return brush === "eraser" ? "cell" : "crosshair";
    return "default";
  }, [tool, brush]);

  return (
    <div className="flex flex-col w-full bg-black text-white">
      {/* Small-screen warning */}
      {isSmall && (
        <div className="bg-white/5 text-white text-sm p-2 rounded-md border border-white/20 text-center mb-2">
          ⚠️ Better on tablet/laptop for precision. Still works on mobile.
        </div>
      )}

      {/* Top bar - dark container, white buttons, nhẹ viền trắng */}
      <div className="flex flex-wrap items-center gap-2 bg-black text-white rounded-xl px-3 py-2 border border-white/20 shadow-sm">
        {/* Tool group */}
        <div className="flex items-center gap-2">
          <button
            className={`px-3 py-2 rounded-lg border transition-all ${
              tool === "mouse"
                ? "border-white bg-white text-black"
                : "border-white/30 bg-black text-white"
            } inline-flex items-center gap-2`}
            onClick={() => setTool("mouse")}
            title="Mouse — drag background"
          >
            <MousePointerClick className="w-4 h-4" /> Move
          </button>

          <button
            className={`px-3 py-2 rounded-lg border transition-all ${
              tool === "draw"
                ? "border-white bg-white text-black"
                : "border-white/30 bg-black text-white"
            }`}
            onClick={() => setTool("draw")}
            title="Draw"
          >
            <span className="inline-flex items-center gap-2">
              <Pencil className="w-4 h-4" />
              Draw
            </span>
          </button>

          <button
            className={`px-3 py-2 rounded-lg border transition-all ${
              tool === "sticker"
                ? "border-white bg-white text-black"
                : "border-white/30 bg-black text-white"
            }`}
            onClick={() => setTool("sticker")}
            title="Sticker"
          >
            <span className="inline-flex items-center gap-2">
              <Sticker className="w-4 h-4" />
              Sticker
            </span>
          </button>
        </div>

        {/* Upload group */}
        <div className="flex items-center gap-2 ml-2">
          <span className="text-sm text-white/80">Frame:</span>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onUploadFrame(e.target.files?.[0])}
            />
            <span className="px-3 py-2 rounded-lg bg-white text-black inline-flex items-center gap-2 border border-white/20">
              <Upload className="w-4 h-4" /> Upload
            </span>
          </label>
          {frameImg && (
            <span className="text-xs text-white/60">Fixed overlay • auto fit</span>
          )}
        </div>

        <div className="flex items-center gap-2 ml-4">
          <span className="text-sm text-white/80">Background:</span>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onUploadBg(e.target.files?.[0])}
            />
            <span className="px-3 py-2 rounded-lg bg-white text-black inline-flex items-center gap-2 border border-white/20">
              <ImageIcon className="w-4 h-4" /> Choose
            </span>
          </label>

          {bgImg && (
            <>
              <span className="text-xs text-white/70">Zoom</span>
              <input
                type="range"
                min={bgScaleInfo.min}
                max={bgScaleInfo.max}
                step={0.01}
                value={bgTransform.scale}
                onChange={(e) => {
                  const s = Number(e.target.value);
                  setBgTransform((t) => ({ ...t, scale: s }));
                }}
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => centerBgAtScale(bgScaleInfo.fit)}
                  className="px-2 py-1 rounded-md bg-white text-black border border-white/20"
                >
                  Fit
                </button>
                <button
                  onClick={() => centerBgAtScale(bgScaleInfo.fill)}
                  className="px-2 py-1 rounded-md bg-white text-black border border-white/20"
                >
                  Fill
                </button>
                <button
                  onClick={() => centerBgAtScale(1)}
                  className="px-2 py-1 rounded-md bg-white text-black border border-white/20"
                >
                  1:1
                </button>
                <span className="text-xs text-white/60">(drag with Move)</span>
              </div>
            </>
          )}
        </div>

        {/* Right side actions */}
        <div className="ml-auto flex items-center gap-2">
          <label className="text-xs inline-flex items-center gap-1 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showGuides}
              onChange={(e) => setShowGuides(e.target.checked)}
            />
            Guides
          </label>

          <button
            onClick={exportPNG}
            className="px-3 py-2 rounded-lg bg-white text-black font-medium border border-white/20"
          >
            <span className="inline-flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export PNG
            </span>
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        className="mt-3 rounded-2xl border-2 border-white/20 bg-black overflow-hidden"
        ref={containerRef}
      >
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
          style={{ background: "#000", cursor }}
          onClick={(e) => {
            if (e.target === e.target.getStage()) deselect();
          }}
        >
          {/* LAYER 0: guides */}
          <Layer listening={false} visible={showGuides}>
            <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill="#000" />
            <Rect
              x={cardX}
              y={cardY}
              width={cardW}
              height={cardH}
              cornerRadius={cornerRadius}
              stroke="#FFFFFF33"
              strokeWidth={2}
            />
            <Rect
              x={cardX + 24}
              y={cardY + 24}
              width={cardW - 48}
              height={cardH - 48}
              cornerRadius={Math.max(8, cornerRadius - 12)}
              stroke="#FFFFFF22"
              dash={[8, 6]}
            />
          </Layer>

          {/* LAYER 1: background (clipped to rounded card) */}
          <Layer>
            <Group
              x={cardX}
              y={cardY}
              clipFunc={(ctx) => {
                const r = cornerRadius,
                  w = cardW,
                  h = cardH,
                  x = 0,
                  y = 0;
                ctx.beginPath();
                ctx.moveTo(x + r, y);
                ctx.arcTo(x + w, y, x + w, y + h, r);
                ctx.arcTo(x + w, y + h, x, y + h, r);
                ctx.arcTo(x, y + h, x, y, r);
                ctx.arcTo(x, y, x + w, y, r);
                ctx.closePath();
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
                    const { x, y } = e.target.position();
                    setBgTransform((t) => ({ ...t, x, y }));
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
                const r = cornerRadius,
                  w = cardW,
                  h = cardH,
                  x = 0,
                  y = 0;
                ctx.beginPath();
                ctx.moveTo(x + r, y);
                ctx.arcTo(x + w, y, x + w, y + h, r);
                ctx.arcTo(x + w, y + h, x, y + h, r);
                ctx.arcTo(x, y + h, x, y, r);
                ctx.arcTo(x, y, x + w, y, r);
                ctx.closePath();
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

          {/* LAYER 3: stickers (clipped) */}
          <Layer>
            <Group
              x={cardX}
              y={cardY}
              clipFunc={(ctx) => {
                const r = cornerRadius,
                  w = cardW,
                  h = cardH,
                  x = 0,
                  y = 0;
                ctx.beginPath();
                ctx.moveTo(x + r, y);
                ctx.arcTo(x + w, y, x + w, y + h, r);
                ctx.arcTo(x + w, y + h, x, y + h, r);
                ctx.arcTo(x, y + h, x, y, r);
                ctx.arcTo(x, y, x + w, y, r);
                ctx.closePath();
              }}
            >
              {stickers.map((s) => (
                <SelectableSticker
                  key={s.id}
                  item={s}
                  selected={isSelected(s.id)}
                  tool={tool}
                  onSelect={(id) => setSelectedId(id)}
                  onChange={(ns) =>
                    setStickers((prev) => prev.map((p) => (p.id === ns.id ? ns : p)))
                  }
                />
              ))}
            </Group>
          </Layer>

          {/* LAYER 4: frame (fixed overlay) */}
          <Layer listening={false}>
            <Group
              x={cardX}
              y={cardY}
              clipFunc={(ctx) => {
                const r = cornerRadius,
                  w = cardW,
                  h = cardH,
                  x = 0,
                  y = 0;
                ctx.beginPath();
                ctx.moveTo(x + r, y);
                ctx.arcTo(x + w, y, x + w, y + h, r);
                ctx.arcTo(x + w, y + h, x, y + h, r);
                ctx.arcTo(x, y + h, x, y, r);
                ctx.arcTo(x, y, x + w, y, r);
                ctx.closePath();
              }}
            >
              {frameImg && (
                <KonvaImage
                  image={frameImg}
                  x={0}
                  y={0}
                  width={cardW}
                  height={cardH}
                  listening={false}
                />
              )}
            </Group>
          </Layer>
        </Stage>
      </div>

      {/* Bottom controls */}
      <div className="mt-3 bg-black text-white border border-white/20 rounded-xl p-3">
        {/* Sticker upload (only when Sticker tool) */}
        {tool === "sticker" && (
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => onUploadStickers(e.target.files)}
              />
              <span className="px-3 py-2 rounded-lg bg-white text-black inline-flex items-center gap-2 border border-white/20">
                <Upload className="w-4 h-4" /> Upload Sticker(s)
              </span>
            </label>
            <span className="text-xs text-white/70">
              Select and drag/resize. Press <b>Delete</b> to remove selected.
            </span>
          </div>
        )}

        {/* Draw controls */}
        {tool === "draw" && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {(["normal", "highlight", "eraser"] as BrushType[]).map((b) => (
                <button
                  key={b}
                  onClick={() => setBrush(b)}
                  className={`px-3 py-2 rounded-lg border ${
                    brush === b
                      ? "border-white bg-white text-black"
                      : "border-white/30 bg-black text-white"
                  }`}
                >
                  {b === "eraser" ? (
                    <>
                      <Eraser className="w-4 h-4 inline-block mr-1" />
                      Eraser
                    </>
                  ) : b === "highlight" ? (
                    "Highlight"
                  ) : (
                    "Pen"
                  )}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/70">Quick colors</span>
                <div className="flex items-center gap-2">
                  {palette.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className="h-7 w-7 rounded-full border"
                      style={{ background: c, borderColor: "rgba(255,255,255,0.3)" }}
                      title={c}
                    />
                  ))}
                  <label className="h-7 w-7 rounded-full border bg-white flex items-center justify-center cursor-pointer">
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

              <div className="flex items-center gap-2">
                <span className="text-xs text-white/70">Thickness</span>
                <input
                  type="range"
                  min={2}
                  max={60}
                  step={1}
                  value={thickness}
                  onChange={(e) => setThickness(Number(e.target.value))}
                />
                <span className="text-xs text-white/80">{thickness}px</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-white/70">Opacity</span>
                <input
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                />
                <span className="text-xs text-white/80">
                  {Math.round(opacity * 100)}%
                </span>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={undo}
                  className="px-3 py-2 rounded-lg bg-white text-black border border-white/20"
                >
                  ↶ Undo
                </button>
                <button
                  onClick={redo}
                  className="px-3 py-2 rounded-lg bg-white text-black border border-white/20"
                >
                  ↷ Redo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
