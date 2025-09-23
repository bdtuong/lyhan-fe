import axios from "axios"

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/v1/boards`

// 🟢 Lấy danh sách posts với phân trang
export async function getPosts(page = 1, pageSize = 10) {
  const res = await fetch(`${API_URL}?page=${page}&pageSize=${pageSize}`)
  if (!res.ok) throw new Error("❌ Lỗi fetch posts")
  return res.json()
}

// 🟢 Lấy danh sách posts theo hashtag
export async function getPostsByHashtag(tag: string, page = 1, pageSize = 10) {
  const res = await fetch(
    `${API_URL}/by-hashtag?tag=${encodeURIComponent(tag)}&page=${page}&pageSize=${pageSize}`
  )
  if (!res.ok) throw new Error("❌ Lỗi fetch posts by hashtag")
  return res.json()
}

// 🟢 Tạo post mới
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

  if (data.images && data.images.length > 0) {
    data.images.forEach((img) => {
      formData.append("images", img)
    })
  }

  const res = await fetch(API_URL, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  })

  const json = await res.json()
  if (!res.ok) throw new Error(json.message || "❌ Lỗi tạo post")
  return json
}

// 🟢 Lấy posts theo user
export async function getUserPosts(userId: string, token: string, page = 1, pageSize = 9) {
  const res = await fetch(`${API_URL}?userId=${userId}&page=${page}&pageSize=${pageSize}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error("❌ Lỗi fetch user posts")
  return res.json()
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

// 🆕 Search posts (title, content, hashtag, user)
export async function searchPosts(q: string) {
  const res = await fetch(`${API_URL}/search/content?q=${encodeURIComponent(q)}`)
  if (!res.ok) throw new Error("❌ Lỗi search posts")
  return res.json()
}
