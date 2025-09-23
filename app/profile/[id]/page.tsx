"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { Loader2, Camera } from "lucide-react"
import { decodeJWT } from "@/utils/jwt"
import { getUser, uploadAvatar } from "@/services/auth.services"
import { getUserPosts } from "@/services/post.services"
import { Lightbox, LightboxImage } from "@/components/lightbox"

type ImgItem = { key: string; src: string; postId: string }

export default function ProfilePage() {
  const { id } = useParams() as { id: string }
  const profileId = id || ""

  const [loggedInId, setLoggedInId] = useState("")
  const [username, setUsername] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [loadingUser, setLoadingUser] = useState(true)

  // paging
  const [page, setPage] = useState(1)
  const pageSize = 18
  const [hasMore, setHasMore] = useState(true)
  const [loadingPage, setLoadingPage] = useState(false)

  // gallery
  const [images, setImages] = useState<ImgItem[]>([])
  const loaderRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // lightbox
  const [selectedImage, setSelectedImage] = useState<LightboxImage | null>(null)
  const lightboxImages = useMemo<LightboxImage[]>(
    () =>
      images.map((img, i) => ({
        id: i,
        src: img.src,
        alt: `Ảnh ${i + 1}`,
        content: "",
        category: ["Ảnh"],
      })),
    [images]
  )

  // fetch user + first page
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token || !profileId) return

    const decoded = decodeJWT(token)
    setLoggedInId(decoded?.id)

    setLoadingUser(true)
    Promise.all([getUser(profileId, token), getUserPosts(profileId, token, 1, pageSize)])
      .then(([userData, firstPage]) => {
        setUsername(userData.username || "")
        setAvatarUrl(Array.isArray(userData.avatar) ? userData.avatar[0] : userData.avatar || "")

        const firstImgs = flattenPostsToImages(firstPage.boards || [])
        setImages(firstImgs)

        setHasMore((firstPage.currentPage || 1) < (firstPage.totalPages || 1))
        setPage(2)
      })
      .finally(() => setLoadingUser(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId])

  // infinite scroll
  useEffect(() => {
    const el = loaderRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first.isIntersecting && hasMore && !loadingPage) {
          void loadMore()
        }
      },
      { rootMargin: "300px 0px", threshold: 0 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [hasMore, loadingPage])

  const loadMore = async () => {
    const token = localStorage.getItem("token")
    if (!token || !profileId) return
    setLoadingPage(true)
    try {
      const res = await getUserPosts(profileId, token, page, pageSize)
      const newImgs = flattenPostsToImages(res.boards || [])
      setImages((prev) => [...prev, ...newImgs])
      setHasMore((res.currentPage || page) < (res.totalPages || page))
      setPage((p) => p + 1)
    } finally {
      setLoadingPage(false)
    }
  }

  // avatar (self only)
  const onPickAvatar = () => {
    if (loggedInId === profileId) fileInputRef.current?.click()
  }
  const onAvatarChanged = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profileId) return
    try {
      const data = await uploadAvatar(profileId, file)
      setAvatarUrl(data.avatarUrl)
    } catch {
      alert("Không thể upload avatar")
    }
  }

  const totalCount = useMemo(() => images.length, [images])

  if (loadingUser) {
    return (
      <div className="flex items-center justify-center min-h-dvh text-white bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div
      className="
        relative min-h-dvh bg-slate-900 text-white
        bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950
      "
    >
      <main className="pt-24 pb-24 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl space-y-10">
          {/* Header */}
          <div className="bg-slate-800/70 backdrop-blur rounded-2xl p-6 shadow-xl ring-1 ring-slate-700/60">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
              <div className="relative">
                <img
                  src={
                    avatarUrl ||
                    "https://ui-avatars.com/api/?name=" + encodeURIComponent(username || "User")
                  }
                  alt={`${username} avatar`}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover shadow-lg ring-4 ring-cyan-400/30"
                />
                {loggedInId === profileId && (
                  <>
                    <button
                      onClick={onPickAvatar}
                      aria-label="Đổi avatar"
                      className="
                        absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4
                        inline-flex items-center justify-center
                        w-9 h-9 sm:w-10 sm:h-10 rounded-full
                        bg-cyan-500 hover:bg-cyan-600
                        text-white shadow-lg
                        ring-4 ring-slate-900
                      "
                    >
                      <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={onAvatarChanged}
                    />
                  </>
                )}
              </div>

              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-cyan-300">{username}</h1>
                <p className="text-gray-400 mt-1">
                  {loggedInId === profileId ? "Bạn" : "Thành viên Lyhan Fanclub"}
                </p>
                <p className="text-xs text-gray-500 mt-1">Tổng ảnh: {totalCount}</p>
              </div>
            </div>
          </div>

          {/* Gallery */}
          <section>
            <h2 className="text-xl font-semibold text-cyan-300 mb-3">Ảnh đã đăng</h2>

            {/* Masonry via CSS columns */}
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
              {images.map((img, idx) => (
                <div key={img.key} className="break-inside-avoid mb-4 overflow-hidden rounded-xl">
                  <img
                    src={img.src}
                    alt={`Ảnh ${idx + 1}`}
                    className="w-full h-auto block hover:opacity-90 transition cursor-zoom-in"
                    loading="lazy"
                    decoding="async"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    onClick={() => setSelectedImage(lightboxImages[idx])}
                  />
                </div>
              ))}
            </div>

            {/* Infinite sentinel */}
            <div ref={loaderRef} className="flex justify-center py-8">
              {loadingPage ? (
                <div className="flex items-center gap-2 text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang tải thêm…</span>
                </div>
              ) : !hasMore ? (
                <p className="text-gray-500 text-sm">Đã hết nội dung</p>
              ) : null}
            </div>
          </section>
        </div>
      </main>

      {/* Lightbox */}
      {selectedImage && (
        <Lightbox
          image={selectedImage}
          images={lightboxImages}
          onClose={() => setSelectedImage(null)}
          onNext={(next) => setSelectedImage(next)}
          onPrevious={(prev) => setSelectedImage(prev)}
        />
      )}
    </div>
  )
}

/** Utils */
function flattenPostsToImages(boards: any[]): ImgItem[] {
  const items: ImgItem[] = []
  for (const post of boards) {
    if (Array.isArray(post.images) && post.images.length > 0) {
      post.images.forEach((src: string, idx: number) =>
        items.push({ key: `${post._id}-${idx}`, src, postId: post._id })
      )
    } else if (post.imageUrl) {
      items.push({ key: `${post._id}-0`, src: post.imageUrl, postId: post._id })
    }
  }
  return items
}
