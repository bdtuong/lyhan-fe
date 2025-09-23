const API_URL = process.env.NEXT_PUBLIC_API_URL 

// 📌 Lấy comment theo boardId + pagination
export async function getComments(boardId: string, page = 1, pageSize = 10, token?: string) {
  const res = await fetch(
    `${API_URL}/v1/Comment/board/${boardId}?page=${page}&pageSize=${pageSize}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  )
  if (!res.ok) throw new Error("❌ Lỗi fetch comments")
  return res.json()
}

// 📌 Tạo comment mới
export async function createComment(
  data: { boardId: string; userId: string; content: string; username: string },
  token: string
) {
  const res = await fetch(`${API_URL}/v1/Comment/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("❌ Lỗi tạo comment")
  return res.json()
}

// 📌 Xóa comment
export async function deleteComment(commentId: string, token: string) {
  const res = await fetch(`${API_URL}/v1/Comment/${commentId}/delete`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!res.ok) throw new Error("❌ Lỗi xóa comment")
  return res.json()
}

// 📌 Vote comment (up/down)
export async function voteComment(
  commentId: string,
  type: "up" | "down",
  userId: string,
  token: string
) {
  const res = await fetch(`${API_URL}/v1/Comment/${commentId}/vote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ type, userId }),
  })
  if (!res.ok) throw new Error("❌ Lỗi vote comment")
  return res.json()
}

// 📌 Reply comment (tạo comment con)
export async function replyComment(
  parentCommentId: string,
  data: { boardId: string; userId: string; content: string; username: string },
  token: string
) {
  const res = await fetch(`${API_URL}/v1/Comment/${parentCommentId}/replies`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("❌ Lỗi reply comment")
  return res.json()
}
