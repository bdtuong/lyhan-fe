"use client"

import { useState, useEffect, useRef } from "react"
import { X } from "lucide-react"
import { decodeJWT } from "@/utils/jwt"
import { getUser } from "@/services/auth.services"
import { getComments, createComment } from "@/services/comment.services"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CommentItem } from "./CommentItem"

// helper: build cây comments
function buildCommentTree(comments: any[]) {
  const map = new Map()
  const roots: any[] = []

  comments.forEach((c) => {
    c.children = []
    map.set(c._id, c)
  })

  comments.forEach((c) => {
    if (c.parentId) {
      map.get(c.parentId)?.children.push(c)
    } else {
      roots.push(c)
    }
  })

  return roots
}

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

  const [newComment, setNewComment] = useState("")
  const [currentUser, setCurrentUser] = useState<{ userId: string; username: string; avatar: string }>({
    userId: "",
    username: "Bạn",
    avatar: "/avatars/default.png",
  })

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
  }, [hasMore, loading])

  // gửi comment mới
  const handleSendComment = async () => {
    if (!newComment.trim() || !currentUser.userId) return
    try {
      const token = localStorage.getItem("token") || ""
      const comment = await createComment(
        { boardId: postId, userId: currentUser.userId, content: newComment, username: currentUser.username },
        token
      )

      setComments((prev) => {
        const exists = prev.some((c) => c._id === comment._id)
        return exists ? prev : [{ ...comment }, ...prev]
      })

      setNewComment("")
    } catch (err) {
      console.error("❌ Lỗi gửi comment:", err)
    }
  }

  const commentTree = buildCommentTree(comments)

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white text-black w-full max-w-lg rounded-lg shadow-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="font-semibold">Bình luận</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-black">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {commentTree.map((c) => (
            <CommentItem
              key={c._id}
              comment={c}
              postId={postId}
              currentUser={currentUser}
              onReplyAdded={(reply) => setComments((prev) => [...prev, reply])}
            />
          ))}

          {/* infinite scroll loader */}
          {hasMore && (
            <div
              ref={loaderRef}
              className="flex justify-center py-4 text-gray-500 text-sm"
            >
              {loading ? "Đang tải..." : "Kéo xuống để xem thêm"}
            </div>
          )}
        </div>

        {/* Input box */}
        <div className="flex items-center gap-2 p-4 border-t">
          <img src={currentUser.avatar} alt="me" className="w-8 h-8 rounded-full" />
          <Input
            placeholder="Viết bình luận..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1"
          />
          <Button size="sm" onClick={handleSendComment}>
            Gửi
          </Button>
        </div>
      </div>
    </div>
  )
}
