"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { Loader2, Camera, MoreVertical, Trash2, Edit3, X } from "lucide-react"
import { decodeJWT } from "@/utils/jwt"
import { getUser, uploadAvatar } from "@/services/auth.services"
import { getUserPosts, updatePost, deletePost } from "@/services/post.services"
import { Lightbox, LightboxImage } from "@/components/lightbox"
import { PostItem } from "@/components/PostItem"
import { toast, Toaster } from "react-hot-toast"


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


  useEffect(() => {
  const handleClickOutside = (e: MouseEvent) => {
    if (!(e.target instanceof Node)) return
    const activeMenu = document.querySelector(`[data-menu-id="${openMenuId}"]`)
    if (activeMenu && !activeMenu.contains(e.target)) {
      setOpenMenuId(null)
    }
  }

  if (openMenuId) {
    document.addEventListener("mousedown", handleClickOutside)
  }

  return () => {
    document.removeEventListener("mousedown", handleClickOutside)
  }
}, [openMenuId])


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
        setAvatarUrl(
          Array.isArray(userData.avatar) ? userData.avatar[0] : userData.avatar || ""
        )
        const boards = firstPage.boards || []
        console.log("📌 Initial post IDs:", boards.map((p: { _id: any }) => p._id))
        setPosts(boards)
        setHasMore((firstPage.currentPage || 1) < (firstPage.totalPages || 1))
        setPage(2)
      })
      .finally(() => setLoadingUser(false))
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
      toast.success("Avatar updated successfully!")
    } catch {
      toast.error("Unable to upload avatar")
    }
  }


  /** ========== Edit Post ========== */
  const startEdit = (post: Post) => {
    console.log("startEdit", post._id)
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
        images: newImages, // keeps API surface consistent with your original code
      })
      setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)))
      setEditingPost(null)
    } catch {
      alert("Unable to update the post")
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
      alert("Unable to delete the post")
    } finally {
      setDeleting(false)
    }
  }

  const totalCount = useMemo(() => posts.length, [posts])

  if (loadingUser) {
    return (
      <div className="flex items-center justify-center min-h-dvh text-white bg-black">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="relative min-h-dvh text-white bg-black">
      <Toaster position="top-center" />
      <main className="pt-24 pb-24 px-4 sm:px-6">
        {/* Container width similar to FanSocialPage */}
        <div className="mx-auto max-w-2xl space-y-8 lg:space-y-10">
          {/* Header */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 sm:p-6 shadow-2xl border border-white/15">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 sm:gap-6">
              <div className="relative">
                <img
                  src={
                    avatarUrl ||
                    "https://res.cloudinary.com/dn7uzkf7k/image/upload/v1758730740/images_yiv9o4.png"
                  }
                  alt={`${username} avatar`}
                  className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full object-cover shadow-xl ring-4 ring-white/10"
                />
                {loggedInId === profileId && (
                  <>
                    <button
                      onClick={onPickAvatar}
                      aria-label="Change avatar"
                      className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 text-white shadow-lg border border-white/20 backdrop-blur"
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
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  {username}
                </h1>
                <p className="text-white/60 mt-1">
                  {loggedInId === profileId ? "You" : "Lyhan Fanclub member"}
                </p>
                <p className="text-xs text-white/40 mt-1">Total posts: {totalCount}</p>
              </div>
            </div>
          </div>

          {/* Posts */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Posts</h2>

            <div className="space-y-6">
              {posts.map((post) => (
                <PostItem
  key={post._id}
  post={post}
  actionsSlot={
    loggedInId === profileId && (
      <div className="relative">
        <button
          className="text-white/60 hover:text-white p-2 -mr-2"
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
            data-menu-id={post._id} // ✅ Thêm data-attr để outside click biết cái nào
            className="absolute right-0 mt-2 w-44 rounded-xl border border-white/15 bg-black/70 backdrop-blur-xl shadow-2xl z-10 overflow-hidden"
            role="menu"
          >
            <button
              className="flex items-center w-full px-3 py-2 text-sm hover:bg-white/5"
              onClick={() => startEdit(post)}
            >
              <Edit3 className="w-4 h-4 mr-2" /> Edit
            </button>
            <button
              className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:bg-white/5"
              onClick={() => confirmDelete(post)}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete
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
                <div className="flex items-center gap-2 text-white/60">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading more…</span>
                </div>
              ) : !hasMore ? (
                <p className="text-white/40 text-sm">No more content</p>
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
          <div className="bg-black/70 backdrop-blur-xl rounded-2xl p-5 sm:p-6 w-full max-w-2xl shadow-2xl border border-white/15 my-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg sm:text-xl font-semibold text-white">Edit post</h3>
              <button
                className="p-2 rounded-lg hover:bg-white/5"
                onClick={() => setEditingPost(null)}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/70 mb-1">Content</label>
                <textarea
                  className="w-full rounded-lg p-3 bg-black/60 text-white border border-white/15 focus:outline-none focus:ring-2 focus:ring-white/20"
                  rows={5}
                  placeholder="Write something…"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
              </div>

              {/* Old images */}
              {keepOldImages.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/70">Existing images</span>
                    <span className="text-xs text-white/40">
                      {keepOldImages.length} image(s)
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
                          className="absolute top-1 right-1 bg-black/70 hover:bg-black/80 p-1.5 rounded-full text-white"
                          onClick={() => removeOldImage(idx)}
                          aria-label="Remove this image"
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
                className="rounded-xl border-2 border-dashed border-white/20 hover:border-white/30 transition p-4 sm:p-5 bg-white/5"
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDropFiles}
                role="region"
                aria-label="Drag & drop images here"
              >
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-sm text-white/80">Drag & drop images here, or</p>
                    <p className="text-xs text-white/50">Multiple files supported. JPG/PNG/GIF.</p>
                  </div>
                  <label className="inline-flex items-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm cursor-pointer border border-white/15 backdrop-blur">
                    Choose images
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
                          aria-label="Remove this new image"
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
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15"
                  onClick={() => setEditingPost(null)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-white text-black hover:opacity-90 disabled:opacity-60"
                  disabled={savingEdit}
                  onClick={saveEdit}
                >
                  {savingEdit ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deletingPost && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-black/70 backdrop-blur-xl rounded-xl p-6 w-full max-w-sm shadow-2xl border border-white/15">
            <h3 className="text-lg font-semibold text-red-400 mb-4">Delete post?</h3>
            <p className="text-white/80 mb-6">Are you sure you want to delete this post?</p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg:white/20 border border-white/15"
                onClick={() => setDeletingPost(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-60"
                disabled={deleting}
                onClick={handleDelete}
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
