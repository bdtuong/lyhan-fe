"use client"
import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { getPosts } from "@/services/post.services"
import { getAllComments } from "@/services/comment.services"

type Heart = { id: number; x: number; y: number; size: number; duration: number }
type AnyComment = { _id?: string; content?: string; text?: string; body?: string; [k: string]: any }
type AnyPost = { _id?: string; id?: string; [k: string]: any }

// Chuẩn hoá nhiều kiểu response (posts/boards/items)
function normalizePosts(res: any): { posts: AnyPost[]; totalPages: number } {
  const posts =
    (Array.isArray(res?.posts) && res.posts) ||
    (Array.isArray(res?.boards) && res.boards) ||
    (Array.isArray(res?.items) && res.items) ||
    []
  const totalPages = Number(res?.totalPages ?? 1) || 1
  return { posts, totalPages }
}

export default function FloatingHearts() {
  const [hearts, setHearts] = useState<Heart[]>([])
  const [showModal, setShowModal] = useState(false)
  const [modalText, setModalText] = useState<string>("")
  const [allComments, setAllComments] = useState<AnyComment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch tất cả posts + gom toàn bộ comments (song song)
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true)
        setError(null)

        const firstRes = await getPosts(1, 50)
        const first = normalizePosts(firstRes)
        let posts: AnyPost[] = [...first.posts]

        if (first.totalPages > 1) {
          const pages = Array.from({ length: first.totalPages - 1 }, (_, i) => i + 2)
          const more = await Promise.allSettled(pages.map((p) => getPosts(p, 50)))
          for (const r of more) {
            if (r.status === "fulfilled") {
              const n = normalizePosts(r.value)
              posts.push(...n.posts)
            }
          }
        }

        const ids = posts.map((p) => (p?._id || p?.id || "").toString()).filter(Boolean)
        const token = localStorage.getItem("token") || ""
        const sets = await Promise.allSettled(ids.map((id) => getAllComments(id, token)))

        const merged: AnyComment[] = []
        const seen = new Set<string>()
        for (const r of sets) {
          if (r.status === "fulfilled" && Array.isArray(r.value)) {
            for (const c of r.value) {
              const cid = (c?._id || "").toString()
              if (cid && !seen.has(cid)) {
                seen.add(cid)
                merged.push(c)
              }
            }
          }
        }
        setAllComments(merged)
      } catch (e: any) {
        setError(e?.message || "Lỗi tải dữ liệu")
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  // Tim bay
  useEffect(() => {
    const interval = setInterval(() => {
      const id = Date.now()
      const isDown = Math.random() < 0.6
      const heart: Heart = {
        id,
        x: 600 + Math.random() * 300,
        y: isDown ? Math.random() * 400 + 200 : -(Math.random() * 80 + 20),
        size: 30 + Math.random() * 60,
        duration: 6 + Math.random() * 6,
      }
      setHearts((prev) => [...prev, heart])
      setTimeout(() => {
        setHearts((prev) => prev.filter((h) => h.id !== id))
      }, heart.duration * 1000)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleClickHeart = () => {
    if (loading) {
      setModalText("Đang tải bình luận…")
      setShowModal(true)
      return
    }
    if (error) {
      setModalText(`⚠️ ${error}`)
      setShowModal(true)
      return
    }
    if (!allComments.length) {
      setModalText("😶 Chưa có bình luận nào.")
      setShowModal(true)
      return
    }
    const c = allComments[Math.floor(Math.random() * allComments.length)]
    const text = c?.content ?? c?.text ?? c?.body ?? "(Không có nội dung)"
    setModalText(text)
    setShowModal(true)
  }

  const loadedInfo = useMemo(() => {
    if (loading) return "Đang tải bình luận…"
    if (error) return "Lỗi tải bình luận"
    return `Đã nạp ${allComments.length} bình luận`
  }, [loading, error, allComments.length])

  return (
    <div
      className="relative w-full h-screen overflow-hidden text-white"
      style={{
        backgroundImage: "url('/room.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* trạng thái góc */}
      <div className="absolute top-3 right-3 bg-black/40 rounded-md px-3 py-1 text-xs">
        {loadedInfo}
      </div>

      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute cursor-pointer"
          style={{ left: "32%", top: "33%", width: heart.size, height: heart.size }}
          initial={{ opacity: 0, x: 0, y: 0, scale: 0.8 }}
          animate={{
            x: heart.x,
            y: [0, heart.y * 0.3, heart.y * 0.6, heart.y],
            opacity: [0, 1, 0],
            scale: [0.8, 1, 1],
            rotate: Math.random() * 40 - 20,
          }}
          transition={{ duration: heart.duration, ease: "easeInOut" }}
          onClick={handleClickHeart}
        >
          {/* Trái tim: màu đen + viền sáng nhẹ */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-full h-full"
            fill="black"
            style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.45))" }}
          >
            <path
              d="M12 21s-6.716-4.744-10-9.714C-1.09 7.32 2.136 2 7 2c2.5 0 4.5 1.8 5 2.8C12.5 3.8 14.5 2 17 2c4.864 0 8.09 5.32 5 9.286C18.716 16.256 12 21 12 21z"
              stroke="white"
              strokeOpacity="0.35"
              strokeWidth="0.6"
            />
          </svg>
        </motion.div>
      ))}

      {/* Modal glass đen, quote NGANG to */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "tween", duration: 0.18 }}
            className="
              relative w-[92%] max-w-2xl
              rounded-2xl border border-white/10
              bg-black/55 backdrop-blur-xl
              shadow-[0_10px_30px_rgba(0,0,0,0.45)]
              p-6 sm:p-8
            "
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 24px)" }}
          >
            {/* Đóng */}
            <button
              onClick={() => setShowModal(false)}
              aria-label="Đóng"
              className="
                absolute right-3 top-3
                inline-flex items-center justify-center
                w-9 h-9 rounded-xl
                bg-white/5 hover:bg-white/10
                border border-white/10
                text-white/80 hover:text-white
                focus:outline-none focus:ring-2 focus:ring-white/30
              "
            >
              ✕
            </button>

            {/* Quote ngang */}
            <div className="text-center">
              <p className="text-xl sm:text-2xl md:text-3xl font-medium leading-relaxed text-white/95">
                <span className="align-middle select-none">“</span>
                <span className="px-2 align-middle italic">{modalText}</span>
                <span className="align-middle select-none">”</span>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
