"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { X } from "lucide-react"
import { decodeJWT } from "@/utils/jwt"
import { getUser } from "@/services/auth.services"
import { getComments, createComment, replyComment } from "@/services/comment.services"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CommentItem } from "./CommentItem"

// helper: build cây comments
function buildCommentTree(comments: any[]) {
  const map = new Map<string, any>()
  const roots: any[] = []

  for (const c of comments) {
    c.children = []
    map.set(c._id, c)
  }
  for (const c of comments) {
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.children.push(c)
    } else {
      roots.push(c)
    }
  }
  return roots
}

type ReplyTarget = { commentId: string; username: string } | null

export function CommentModal({
  postId,
  onClose,
}: {
  postId: string
  onClose: () => void
}) {
  const [comments, setComments] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const loaderRef = useRef<HTMLDivElement | null>(null)

  const [text, setText] = useState("")
  const [replyTarget, setReplyTarget] = useState<ReplyTarget>(null)

  const [currentUser, setCurrentUser] = useState<{ userId: string; username: string; avatar: string }>({
    userId: "",
    username: "Bạn",
    avatar: "/avatars/default.png",
  })

  // reset khi đổi postId
  useEffect(() => {
    setComments([])
    setPage(1)
    setHasMore(true)
    setReplyTarget(null)
    setText("")
  }, [postId])

  // lấy user info từ token
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return
    const decoded = decodeJWT(token)
    if (!decoded?.id) return

    getUser(decoded.id, token)
      .then((data) => {
        setCurrentUser({
          userId: decoded.id,
          username: data.username || "Bạn",
          avatar:
            Array.isArray(data.avatar) && data.avatar.length > 0
              ? data.avatar[0]
              : data.avatar || "/avatars/default.png",
        })
      })
      .catch((err) => console.error("❌ getUser error:", err))
  }, [])

  // fetch comments theo trang
  useEffect(() => {
    const loadComments = async () => {
      if (loading || !hasMore) return
      setLoading(true)
      try {
        const token = localStorage.getItem("token") || ""
        const data = await getComments(postId, page, 5, token)

        setComments((prev) => {
          const merged = [...prev, ...data.comments]
          const unique = merged.filter(
            (c, i, self) => i === self.findIndex((x) => x._id === c._id)
          )
          return unique
        })

        setHasMore(page < data.totalPages)
      } catch (err) {
        console.error("❌ Lỗi fetch comments:", err)
      } finally {
        setLoading(false)
      }
    }
    loadComments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, postId])

  // infinite scroll
  useEffect(() => {
    const target = loaderRef.current
    if (!target) return

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first.isIntersecting && hasMore && !loading) {
          setPage((p) => p + 1)
        }
      },
      { rootMargin: "200px" }
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [hasMore, loading, comments.length])

  // gửi từ ô nhập duy nhất
  const handleSend = useCallback(async () => {
    const content = text.trim()
    if (!content || !currentUser.userId) return

    try {
      const token = localStorage.getItem("token") || ""

      if (replyTarget) {
        // gửi reply tới commentId
        const newReply = await replyComment(
          replyTarget.commentId,
          { boardId: postId, userId: currentUser.userId, content, username: currentUser.username },
          token
        )
        setComments((prev) => {
          const exists = prev.some((c) => c._id === newReply._id)
          return exists ? prev : [newReply, ...prev]
        })
        setReplyTarget(null)
      } else {
        // gửi bình luận gốc
        const comment = await createComment(
          { boardId: postId, userId: currentUser.userId, content, username: currentUser.username },
          token
        )
        setComments((prev) => {
          const exists = prev.some((c) => c._id === comment._id)
          return exists ? prev : [comment, ...prev]
        })
      }

      setText("")
    } catch (err) {
      console.error("❌ Lỗi gửi:", err)
    }
  }, [text, currentUser, replyTarget, postId])

  // Enter để gửi (Input)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const commentTree = buildCommentTree(comments)

  return (
    <div
      className="
        fixed inset-0 z-50 flex items-center justify-center
        bg-black/60 backdrop-blur-sm
        overscroll-none
      "
      role="dialog"
      aria-modal="true"
    >
      {/* Glass black panel */}
      <div
        className="
          w-full sm:max-w-lg
          h-[100dvh] sm:h-[85dvh]
          sm:rounded-2xl rounded-none
          border border-white/10
          bg-black/50 backdrop-blur-xl
          text-white shadow-2xl
          flex flex-col
          overscroll-contain
        "
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/30 backdrop-blur-xl">
          <h2 className="font-semibold text-base sm:text-lg">Bình luận</h2>
          <button
            onClick={onClose}
            className="inline-flex p-2 rounded-lg hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {commentTree.map((c) => (
            <CommentItem
              key={c._id}
              comment={c}
              postId={postId}
              currentUser={currentUser}
              onReplyRequest={(commentId, username) => setReplyTarget({ commentId, username })}
            />
          ))}

          {hasMore && (
            <div
              ref={loaderRef}
              className="flex justify-center py-4 text-white/60 text-sm"
            >
              {loading ? "Đang tải..." : "Kéo xuống để xem thêm"}
            </div>
          )}
        </div>

        {/* Input box (single place to write & reply) */}
        <div
          className="
            sticky bottom-0 z-10
            border-t border-white/10
            bg-black/30 backdrop-blur-xl
            px-3 py-3
            space-y-2
          "
          style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)" }}
        >
          {/* trạng thái đang reply */}
          {replyTarget && (
            <div className="flex items-center justify-between text-xs px-2 py-1 rounded-md bg-white/5 border border-white/10">
              <span>
                Đang trả lời <span className="font-semibold">@{replyTarget.username || "Ẩn danh"}</span>
              </span>
              <button
                onClick={() => setReplyTarget(null)}
                className="text-white/70 hover:text-white"
                aria-label="Hủy trả lời"
              >
                Hủy
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <img
              src={currentUser.avatar}
              alt="me"
              className="
                w-8 h-8 rounded-full object-cover shrink-0
                ring-1 ring-emerald-400/40
                shadow-[0_0_8px_rgba(16,185,129,0.25)]
              "
            />
            <Input
              placeholder={replyTarget ? "Viết phản hồi..." : "Viết bình luận..."}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="
                flex-1
                bg-white/5 text-white placeholder:text-white/50
                border-white/10
                focus-visible:ring-white/30 focus-visible:ring-2
              "
            />
            <Button
              size="sm"
              onClick={handleSend}
              className="shrink-0 bg-white/10 hover:bg-white/20 border border-white/10 text-white"
            >
              Gửi
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
