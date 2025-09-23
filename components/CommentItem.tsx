"use client"

import { useState } from "react"
import { useUserInfo } from "@/hooks/useUserInfo"
import { replyComment } from "@/services/comment.services"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function CommentItem({
  comment,
  postId,
  onReplyAdded,
  currentUser,
}: {
  comment: any
  postId: string
  onReplyAdded: (reply: any) => void
  currentUser: { userId: string; username: string; avatar: string }
}) {
  const { userInfo } = useUserInfo(comment.userId)
  const [showReplyBox, setShowReplyBox] = useState(false)
  const [replyText, setReplyText] = useState("")

  const handleReply = async () => {
    if (!replyText.trim()) return
    try {
      const token = localStorage.getItem("token") || ""
      const newReply = await replyComment(
        comment._id,
        { boardId: postId, userId: currentUser.userId, content: replyText, username: currentUser.username },
        token
      )

      onReplyAdded(newReply)
      setReplyText("")
      setShowReplyBox(false)
    } catch (err) {
      console.error("❌ Lỗi reply:", err)
    }
  }

  return (
    <div className="ml-2">
      <div className="flex gap-3">
        <img
          src={userInfo?.avatar || "/avatars/default.png"}
          alt={userInfo?.username || "Ẩn danh"}
          className="w-8 h-8 rounded-full"
        />
        <div>
          <p className="text-sm font-semibold">{userInfo?.username || "Ẩn danh"}</p>
          <p className="text-sm">{comment.content}</p>
          <p className="text-xs text-gray-500">
            {new Date(comment.createdAt).toLocaleString("vi-VN")}
          </p>

          <button
            onClick={() => setShowReplyBox((prev) => !prev)}
            className="text-xs text-blue-500 mt-1"
          >
            Trả lời
          </button>

          {showReplyBox && (
            <div className="mt-2 flex gap-2">
              <Input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Viết phản hồi..."
              />
              <Button size="sm" onClick={handleReply}>
                Gửi
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* render children (reply) đệ quy */}
      {comment.children?.length > 0 && (
        <div className="ml-6 mt-2 space-y-2">
          {comment.children.map((reply: any) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              postId={postId}
              currentUser={currentUser}
              onReplyAdded={onReplyAdded}
            />
          ))}
        </div>
      )}
    </div>
  )
}
