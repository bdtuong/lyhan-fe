"use client"

import { useUserInfo } from "@/hooks/useUserInfo"
import { useState } from "react"

const MAX_DEPTH = 4
const COLLAPSE_THRESHOLD = 3

export function CommentItem({
  comment,
  postId,
  currentUser,
  onReplyRequest,
  depth = 0
}: {
  comment: any
  postId: string
  currentUser: { userId: string; username: string; avatar: string }
  onReplyRequest: (commentId: string, username: string) => void
  depth?: number
}) {
  const { userInfo } = useUserInfo(comment.userId)
  const [showReplies, setShowReplies] = useState(true)

  return (
    <div
      className={`mt-2`}
      style={{
        marginLeft: `${Math.min(depth * 16, 64)}px` // max 64px indent
      }}
    >
      <div className="flex gap-3">
        <img
          src={userInfo?.avatar || "/avatars/default.png"}
          alt={userInfo?.username || "Ẩn danh"}
          className="
            w-8 h-8 rounded-full object-cover
            ring-1 ring-blue-400/40
            shadow-[0_0_8px_rgba(16,185,129,0.25)]
          "
        />
        <div>
          <p className="text-sm font-semibold">{userInfo?.username || "Ẩn danh"}</p>
          <p className="text-sm whitespace-pre-line">{comment.content}</p>
          <p className="text-xs text-gray-400">
            {new Date(comment.createdAt).toLocaleString("vi-VN")}
          </p>

          <button
            onClick={() => onReplyRequest(comment._id, userInfo?.username || "Ẩn danh")}
            className="text-xs text-blue-400 hover:text-blue-300 mt-1"
          >
            Reply
          </button>
        </div>
      </div>

      {/* Children comments */}
      {comment.children?.length > 0 && depth < MAX_DEPTH && (
        <div className="mt-2 space-y-2">
          {/* Collapse button nếu có nhiều reply */}
          {comment.children.length > COLLAPSE_THRESHOLD && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="text-xs text-blue-500 hover:underline ml-2"
            >
              {showReplies ? "Ẩn phản hồi" : `Hiện ${comment.children.length} phản hồi`}
            </button>
          )}

          {showReplies &&
            comment.children.map((reply: any) => (
              <CommentItem
                key={reply._id}
                comment={reply}
                postId={postId}
                currentUser={currentUser}
                onReplyRequest={onReplyRequest}
                depth={depth + 1}
              />
            ))}
        </div>
      )}
    </div>
  )
}
