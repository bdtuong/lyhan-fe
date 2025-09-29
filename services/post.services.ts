import axios from "axios"

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/v1/boards`

// Helper: build query string, bỏ qua undefined/null
function buildQuery(params: Record<string, any>) {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return
    // boolean -> "true"/"false"
    q.append(k, typeof v === "boolean" ? String(v) : String(v))
  })
  const s = q.toString()
  return s ? `?${s}` : ""
}

/** =========================
 *          READ
 *  ========================= */

// 🟢 Lấy danh sách posts với phân trang (mặc định ẩn pending)
export async function getPosts(
  page = 1,
  pageSize = 10,
  options?: { includePending?: boolean }
) {
  const qs = buildQuery({
    page,
    pageSize,
    includePending: options?.includePending ?? false
  })
  const res = await fetch(`${API_URL}${qs}`)
  if (!res.ok) throw new Error("❌ Lỗi fetch posts")
  return res.json()
}

// 🟢 Lấy danh sách posts theo hashtag (mặc định ẩn pending)
export async function getPostsByHashtag(
  tag: string,
  page = 1,
  pageSize = 10,
  options?: { includePending?: boolean }
) {
  const qs = buildQuery({
    tag,
    page,
    pageSize,
    includePending: options?.includePending ?? false
  })
  const res = await fetch(`${API_URL}/by-hashtag${qs}`)
  if (!res.ok) throw new Error("❌ Lỗi fetch posts by hashtag")
  return res.json()
}

// 🟢 Lấy posts theo user (mặc định ẩn pending)
export async function getUserPosts(
  userId: string,
  token: string,
  page = 1,
  pageSize = 9,
  options?: { includePending?: boolean }
) {
  const qs = buildQuery({
    page,
    pageSize,
    includePending: options?.includePending ?? false
  })
  const res = await fetch(`${API_URL}/user/${encodeURIComponent(userId)}${qs}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error("❌ Lỗi fetch user posts")
  return res.json()
}

// 🆕 Lấy chi tiết 1 post (mặc định ẩn pending)
export async function getPostDetails(
  postId: string,
  options?: { includePending?: boolean }
) {
  const qs = buildQuery({ includePending: options?.includePending ?? false })
  const res = await fetch(`${API_URL}/${encodeURIComponent(postId)}${qs}`)
  if (!res.ok) throw new Error("❌ Lỗi fetch post details")
  return res.json()
}

// 🆕 Search posts (title, content, hashtag, user) (mặc định ẩn pending)
export async function searchPosts(keyword: string): Promise<any[]> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL!;
  const url = `${API_URL}/boards/search/content?` + new URLSearchParams({ q: keyword });
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error(`Search failed ${res.status}`);
  const json = await res.json();
  return Array.isArray(json) ? json : Array.isArray(json?.boards) ? json.boards : [];
}



/** =========================
 *         MUTATIONS
 *  ========================= */

// 🟢 Tạo post mới (mặc định server set isPending=true)
export async function createPost(
  data: {
    title: string
    description: string
    language: string
    content: string
    userId: string
    images?: File[]
  },
  token?: string
) {
  const formData = new FormData()
  formData.append("title", data.title)
  formData.append("description", data.description)
  formData.append("language", data.language)
  formData.append("content", data.content)
  formData.append("userId", data.userId)

  if (data.images?.length) {
    data.images.forEach((img) => formData.append("images", img))
  }

  const res = await fetch(API_URL, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData
  })

  const json = await res.json()
  if (!res.ok) throw new Error(json.message || "❌ Lỗi tạo post")
  return json
}

// 🟢 Toggle like/unlike
export async function toggleLike(postId: string, userId: string, token: string) {
  const res = await axios.post(
    `${API_URL}/${postId}/like`,
    { userId },
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return res.data
}

// 🟢 Xoá post
export async function deletePost(postId: string, token: string) {
  const res = await fetch(`${API_URL}/delete-post/${postId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error("❌ Lỗi delete post")
  return res.json()
}

// 🟢 Update post (content/images)
export async function updatePost(
  postId: string,
  token: string,
  data: { content?: string; images?: File[] }
) {
  const formData = new FormData()
  if (data.content) formData.append("content", data.content)
  if (data.images?.length) {
    data.images.forEach((img) => formData.append("images", img))
  }

  const res = await fetch(`${API_URL}/update-post/${postId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  })

  const json = await res.json()
  if (!res.ok) throw new Error(json.message || "❌ Lỗi update post")
  return json
}

/** =========================
 *       MODERATION (Admin)
 *  ========================= */

// 🆕 Duyệt bài: đặt isPending=false
export async function approvePost(postId: string, token: string) {
  const res = await fetch(`${API_URL}/${encodeURIComponent(postId)}/approve`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` }
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || "❌ Lỗi approve post")
  return json
}

// 🆕 Đặt trạng thái pending tuỳ ý
export async function setPending(postId: string, isPending: boolean, token: string) {
  const res = await fetch(`${API_URL}/${encodeURIComponent(postId)}/pending`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ isPending })
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || "❌ Lỗi set pending")
  return json
}
