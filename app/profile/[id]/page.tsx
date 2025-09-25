"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useParams } from "next/navigation"
import {
  Loader2,
  Camera,
  MoreVertical,
  Trash2,
  Edit3,
  X,
} from "lucide-react"
import { decodeJWT } from "@/utils/jwt"
import { getUser, uploadAvatar } from "@/services/auth.services"
import { getUserPosts, updatePost, deletePost } from "@/services/post.services"
import { Lightbox, LightboxImage } from "@/components/lightbox"
import { PostItem } from "@/components/PostItem"

type Post = {
  _id: string
  content?: string
  images?: string[]
  createdAt?: string
}

export default function ProfilePage() {
  const { id } = useParams() as { id: string }
  const profileId = id || ""

  const [loggedInId, setLoggedInId] = useState("")
  const [username, setUsername] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [loadingUser, setLoadingUser] = useState(true)

  // paging
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [hasMore, setHasMore] = useState(true)
  const [loadingPage, setLoadingPage] = useState(false)

  // posts
  const [posts, setPosts] = useState<Post[]>([])
  const loaderRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // lightbox
  const [selectedImage, setSelectedImage] = useState<LightboxImage | null>(null)
  const [lightboxList, setLightboxList] = useState<LightboxImage[]>([])

  // edit modal
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [editContent, setEditContent] = useState("")
  const [keepOldImages, setKeepOldImages] = useState<string[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [savingEdit, setSavingEdit] = useState(false)

  // new image previews (ObjectURL)
  const newImagePreviews = useMemo(
    () => newImages.map((f) => ({ file: f, url: URL.createObjectURL(f) })),
    [newImages]
  )
  useEffect(() => {
    return () => {
      newImagePreviews.forEach((p) => URL.revokeObjectURL(p.url))
    }
  }, [newImagePreviews])

  // delete confirm modal
  const [deletingPost, setDeletingPost] = useState<Post | null>(null)
  const [deleting, setDeleting] = useState(false)

  // dropdown state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!menuRef.current) return
      if (!(e.target instanceof Node)) return
      if (!menuRef.current.contains(e.target)) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

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
        const boards = firstPage.boards || []
        setPosts(boards)
        setHasMore((firstPage.currentPage || 1) < (firstPage.totalPages || 1))
        setPage(2)
      })
      .finally(() => setLoadingUser(false))
  }, [profileId])

  console.log(avatarUrl)

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
      setPosts((prev) => [...prev, ...(res.boards || [])])
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

  /** ========== Edit Post ========== */
  const startEdit = (post: Post) => {
    setEditingPost(post)
    setEditContent(post.content || "")
    setKeepOldImages(Array.isArray(post.images) ? post.images : [])
    setNewImages([])
    setOpenMenuId(null)
  }

  const removeOldImage = (idx: number) => {
    setKeepOldImages((prev) => prev.filter((_, i) => i !== idx))
  }

  const addNewImages = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const list = Array.from(files)
    setNewImages((prev) => {
      const map = new Map(prev.map((f) => [f.name + "_" + f.size, f]))
      for (const f of list) {
        const key = f.name + "_" + f.size
        if (!map.has(key)) map.set(key, f)
      }
      return Array.from(map.values())
    })
  }

  const removeNewImage = (idx: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== idx))
  }

  const onDropFiles = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    addNewImages(e.dataTransfer.files)
  }

  const saveEdit = async () => {
    if (!editingPost) return
    const token = localStorage.getItem("token") || ""
    setSavingEdit(true)
    try {
      const updated = await updatePost(editingPost._id, token, {
        content: editContent,
        images: newImages,
      })
      setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)))
      setEditingPost(null)
    } catch {
      alert("Không thể cập nhật bài viết")
    } finally {
      setSavingEdit(false)
    }
  }

  /** ========== Delete Post ========== */
  const confirmDelete = (post: Post) => {
    setDeletingPost(post)
    setOpenMenuId(null)
  }
  const handleDelete = async () => {
    if (!deletingPost) return
    const token = localStorage.getItem("token") || ""
    setDeleting(true)
    try {
      await deletePost(deletingPost._id, token)
      setPosts((prev) => prev.filter((p) => p._id !== deletingPost._id))
      setDeletingPost(null)
    } catch {
      alert("Không thể xoá bài viết")
    } finally {
      setDeleting(false)
    }
  }

  const totalCount = useMemo(() => posts.length, [posts])

  if (loadingUser) {
    return (
      <div className="flex items-center justify-center min-h-dvh text-white bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="relative min-h-dvh bg-slate-900 text-white bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      <main className="pt-24 pb-24 px-4 sm:px-6">
        {/* 👇 chỉnh width giống FanSocialPage */}
        <div className="mx-auto max-w-2xl space-y-8 lg:space-y-10">
          {/* Header */}
          <div className="bg-slate-800/70 backdrop-blur rounded-2xl p-5 sm:p-6 shadow-xl ring-1 ring-slate-700/60">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 sm:gap-6">
              <div className="relative">
                <img
                  src={
                    avatarUrl ||
                    "https://res.cloudinary.com/dn7uzkf7k/image/upload/v1758730740/images_yiv9o4.png"
                  }
                  alt={`${username} avatar`}
                  className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full object-cover shadow-lg ring-4 ring-cyan-400/30"
                />
                {loggedInId === profileId && (
                  <>
                    <button
                      onClick={onPickAvatar}
                      aria-label="Đổi avatar"
                      className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg ring-4 ring-slate-900"
                    >
                      <Camera className="w-4 h-4 sm:w-5" />
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
                <h1 className="text-2xl sm:text-3xl font-bold text-cyan-300 break-words">
                  {username}
                </h1>
                <p className="text-gray-400 mt-1">
                  {loggedInId === profileId ? "Bạn" : "Thành viên Lyhan Fanclub"}
                </p>
                <p className="text-xs text-gray-500 mt-1">Tổng bài viết: {totalCount}</p>
              </div>
            </div>
          </div>

          {/* Posts */}
          <section>
            <h2 className="text-xl font-semibold text-cyan-300 mb-3">Bài viết</h2>

            <div className="space-y-6">
              {posts.map((post) => (
                <PostItem
                  key={post._id}
                  post={post}
                  actionsSlot={
                    loggedInId === profileId && (
                      <div className="relative" ref={menuRef}>
                        <button
                          className="text-gray-400 hover:text-white p-2 -mr-2"
                          onClick={() =>
                            setOpenMenuId(openMenuId === post._id ? null : post._id)
                          }
                          aria-haspopup="menu"
                          aria-expanded={openMenuId === post._id}
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {openMenuId === post._id && (
                          <div
                            className="absolute right-0 mt-2 w-44 rounded-lg border border-slate-600/40 bg-slate-800/95 backdrop-blur shadow-xl z-10 overflow-hidden"
                            role="menu"
                          >
                            <button
                              className="flex items-center w-full px-3 py-2 text-sm hover:bg-slate-700/60"
                              onClick={() => startEdit(post)}
                            >
                              <Edit3 className="w-4 h-4 mr-2" /> Chỉnh sửa
                            </button>
                            <button
                              className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:bg-slate-700/60"
                              onClick={() => confirmDelete(post)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Xoá bài viết
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  }
                />
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
          images={lightboxList}
          onClose={() => setSelectedImage(null)}
          onNext={(next) => setSelectedImage(next)}
          onPrevious={(prev) => setSelectedImage(prev)}
        />
      )}

      {/* Edit Modal */}
      {editingPost && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4 overflow-y-auto">
          <div className="bg-slate-800 rounded-2xl p-5 sm:p-6 w-full max-w-2xl shadow-2xl ring-1 ring-slate-700/70 my-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg sm:text-xl font-semibold text-cyan-300">
                Chỉnh sửa bài viết
              </h3>
              <button
                className="p-2 rounded-lg hover:bg-slate-700/60"
                onClick={() => setEditingPost(null)}
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nội dung</label>
                <textarea
                  className="w-full rounded-lg p-3 bg-slate-900 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-600/40"
                  rows={5}
                  placeholder="Nội dung"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
              </div>

              {/* Old images */}
              {keepOldImages.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Ảnh hiện có</span>
                    <span className="text-xs text-gray-500">
                      {keepOldImages.length} ảnh
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {keepOldImages.map((img, idx) => (
                      <div key={idx} className="relative group rounded-lg overflow-hidden">
                        <img
                          src={img}
                          className="w-full aspect-square object-cover"
                          alt={`old ${idx + 1}`}
                        />
                        <button
                          className="absolute top-1 right-1 bg-black/70 hover:bg-black/80 p-1.5 rounded-full text-white opacity-90"
                          onClick={() => removeOldImage(idx)}
                          aria-label="Xoá ảnh này"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New images picker */}
              <div
                className="rounded-xl border-2 border-dashed border-slate-600/60 hover:border-slate-500 transition p-4 sm:p-5 bg-slate-900/60"
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDropFiles}
                role="region"
                aria-label="Kéo thả ảnh vào đây"
              >
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-sm text-gray-300">
                      Kéo và thả ảnh vào đây, hoặc
                    </p>
                    <p className="text-xs text-gray-500">
                      Hỗ trợ nhiều ảnh. JPG/PNG/GIF.
                    </p>
                  </div>
                  <label className="inline-flex items-center px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm cursor-pointer">
                    Chọn ảnh
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => addNewImages(e.target.files)}
                    />
                  </label>
                </div>

                {newImagePreviews.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {newImagePreviews.map((it, idx) => (
                      <div key={idx} className="relative rounded-lg overflow-hidden">
                        <img
                          src={it.url}
                          className="w-full aspect-square object-cover"
                          alt={it.file.name}
                        />
                        <button
                          className="absolute top-1 right-1 bg-black/70 hover:bg-black/80 p-1.5 rounded-full text-white"
                          onClick={() => removeNewImage(idx)}
                          aria-label="Gỡ ảnh mới này"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-[10px] text-center py-1 truncate px-1">
                          {it.file.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500"
                  onClick={() => setEditingPost(null)}
                >
                  Hủy
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50"
                  disabled={savingEdit}
                  onClick={saveEdit}
                >
                  {savingEdit ? "Đang lưu…" : "Lưu"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deletingPost && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold text-red-400 mb-4">Xác nhận xoá</h3>
            <p className="text-gray-300 mb-6">Bạn có chắc chắn muốn xoá bài viết này?</p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500"
                onClick={() => setDeletingPost(null)}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50"
                disabled={deleting}
                onClick={handleDelete}
              >
                {deleting ? "Đang xoá…" : "Xoá"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
