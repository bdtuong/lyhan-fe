const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/v1/upload`

// 🟢 Upload 1 ảnh (bg)
export async function uploadImage(file: File, token?: string) {
  const formData = new FormData()
  formData.append("file", file)

  const res = await fetch(API_URL, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  })

  const json = await res.json()
  if (!res.ok) throw new Error(json.message || "❌ Lỗi upload ảnh")
  return json as { url: string }
}
