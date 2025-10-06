"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  ImagePlus,
  Video as VideoIcon,
  X,
  Smile,
  Plus,
  ShieldCheck
} from "lucide-react"
import { decodeJWT } from "@/utils/jwt"
import { getUser } from "@/services/auth.services"
import { getPosts, createPost, approvePost } from "@/services/post.services"
import { PostItem } from "@/components/PostItem"
import { LyhanLoading } from "@/components/ui/loading"
import EmojiPicker from "emoji-picker-react"
import { Toaster, toast } from "react-hot-toast"

type Post = {
  _id: string
  images?: string[]
  content?: string
  title?: string
  userID?: string
  userInfo?: any
  isPending?: boolean
  video?: { url: string }
  [k: string]: any
}

export function FanSocialPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [newContent, setNewContent] = useState("")
  const [newImages, setNewImages] = useState<File[]>([])
  const [newVideo, setNewVideo] = useState<File | null>(null)
  const [posting, setPosting] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const [userId, setUserId] = useState("")
  const [username, setUsername] = useState("You")
  const [avatar, setAvatar] = useState("/avatars/default.png")
  const [isAdmin, setIsAdmin] = useState(false)

  const [page, setPage] = useState(1)
  const [pageSize] = useState(5)
  const [total, setTotal] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)
  const loaderRef = useRef<HTMLDivElement | null>(null)

  const [approvingIds, setApprovingIds] = useState<Record<string, boolean>>({})

  useEffect(() => {
    document.body.style.overflow = showCreateModal ? "hidden" : ""
  }, [showCreateModal])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return
    const decoded = decodeJWT(token)
    setIsAdmin(decoded?.admin === true)
    if (decoded?.id) setUserId(decoded.id)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token || !userId) return

    getUser(userId, token)
      .then((data) => {
        setUsername(data.username || "You")
        setAvatar(Array.isArray(data.avatar) ? data.avatar[0] : data.avatar || "/avatars/default.png")
      })
      .catch((err) => console.error("❌ getUser error:", err))
  }, [userId])

  useEffect(() => {
    let cancel = false
    setLoadingMore(true)

    getPosts(page, pageSize, { includePending: isAdmin })
      .then((data) => {
        if (cancel) return
        const next = (data.boards || []) as Post[]
        const visible = isAdmin ? next : next.filter((p) => p.isPending !== true)
        setPosts((prev) => (page === 1 ? visible : [...prev, ...visible]))
        setTotal(data.totalCount || 0)
      })
      .catch((err) => console.error("❌ fetch posts:", err))
      .finally(() => setLoadingMore(false))

    return () => {
      cancel = true
    }
  }, [page, pageSize, isAdmin])

  useEffect(() => {
    setPage(1)
    setPosts([])
  }, [isAdmin])

  useEffect(() => {
    const target = loaderRef.current
    if (!target) return
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first.isIntersecting && !loadingMore) {
          if (posts.length < total) setPage((prev) => prev + 1)
        }
      },
      { threshold: 1, rootMargin: "200px" }
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [posts, total, loadingMore])

  const handlePost = async () => {
    if (!newContent.trim() || !userId) return
    setPosting(true)
    try {
      const token = localStorage.getItem("token") || ""
      const newPost = await createPost(
        {
          title: newContent.slice(0, 20),
          description: newContent,
          language: "en",
          content: newContent,
          userId,
          images: newImages,
          video: newVideo || undefined
        },
        token
      )
      setPosts((prev) => (isAdmin ? [newPost, ...prev] : prev))
      setNewContent("")
      setNewImages([])
      setNewVideo(null)
      setShowCreateModal(false)
      toast.success("Post created successfully and is awaiting approval.")
    } catch (err) {
      console.error("❌ Upload failed:", err)
      toast.error("Failed to create post.")
    } finally {
      setPosting(false)
    }
  }

  const onEmojiClick = (emojiData: any) => {
    setNewContent((prev) => prev + emojiData.emoji)
    setShowEmoji(false)
  }

  const handleApprove = async (postId: string) => {
    try {
      const token = localStorage.getItem("token") || ""
      setApprovingIds((m) => ({ ...m, [postId]: true }))
      const updated = await approvePost(postId, token)
      setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, ...updated } : p)))
      toast.success("Post approved.")
    } catch (e) {
      console.error("❌ Approve error:", e)
      toast.error("Failed to approve post.")
    } finally {
      setApprovingIds((m) => {
        const n = { ...m }
        delete n[postId]
        return n
      })
    }
  }

  return (
    <>
      <Toaster position="top-center" />

      <main className="pb-20">
        <div className="max-w-2xl mx-auto py-4 px-4">
          <Card className="mb-4 bg-black/40 backdrop-blur-sm border-white/20">
            <CardContent className="p-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full flex gap-3 items-center p-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-white/20 transition-all duration-200"
              >
                <img src={avatar} alt="me" className="w-8 h-8 rounded-full" />
                <span className="text-neutral-400 text-left flex-1 text-sm">What's on your mind?</span>
                <Plus className="w-5 h-5 text-white" />
              </button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {posts.map((post) => {
              const pending = Boolean(post.isPending)
              return (
                <div key={post._id} className="relative">
                  {isAdmin && pending && (
                    <div className="absolute -top-2 right-2 z-10 flex items-center gap-2">
                      <span className="px-2 py-0.5 text-xs rounded-md bg-white/10 border border-white/30 text-white">
                        Pending
                      </span>
                      <Button
                        size="sm"
                        className="h-7 bg-white text-black hover:bg-neutral-300"
                        disabled={!!approvingIds[post._id]}
                        onClick={() => handleApprove(post._id)}
                      >
                        <ShieldCheck className="w-4 h-4 mr-1" />
                        {approvingIds[post._id] ? "Approving..." : "Approve"}
                      </Button>
                    </div>
                  )}
                  <PostItem post={post} />
                </div>
              )
            })}
          </div>

          <div ref={loaderRef} className="flex justify-center py-10">
            {loadingMore && posts.length < total && <LyhanLoading />}
            {posts.length >= total && <p className="text-neutral-400 text-sm">No more posts</p>}
          </div>
        </div>
      </main>

      <button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-20 right-6 z-50 w-14 h-14 rounded-xl bg-white text-black hover:bg-neutral-200 shadow-md border border-white/20 flex items-center justify-center"
      >
        <Plus className="w-6 h-6" />
      </button>

      {showCreateModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative w-full max-w-lg bg-black/90 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl shadow-white/10 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-white/20">
              <h2 className="font-semibold text-lg text-white">Create Post</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full hover:bg-neutral-800/50 flex items-center justify-center text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <img src={avatar} alt="me" className="w-10 h-10 rounded-full" />
                <span className="font-medium text-white">{username}</span>
              </div>
              <Textarea
                placeholder="Write your thoughts about Lyhan..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="min-h-32 bg-transparent border-white/20 text-white placeholder:text-neutral-400 resize-none focus:ring-white/40"
              />
              {newImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {newImages.map((file, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`preview-${i}`}
                        className="w-full aspect-square object-cover rounded-lg border border-white/20"
                      />
                      <button
                        type="button"
                        onClick={() => setNewImages(newImages.filter((_, idx) => idx !== i))}
                        className="absolute -top-2 -right-2 bg-black/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {newVideo && (
                  <div className="relative group mt-3">
                    <video
                      src={URL.createObjectURL(newVideo)}
                      controls
                      className="w-full max-h-72 object-cover rounded-lg border border-white/20"
                    />
                    <button
                      type="button"
                      onClick={() => setNewVideo(null)}
                      className="absolute -top-2 -right-2 bg-black/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              {showEmoji && (
                <div className="border border-white/20 rounded-lg overflow-hidden">
                  <EmojiPicker onEmojiClick={onEmojiClick} width="100%" />
                </div>
              )}
            </div>
            <div className="p-4 border-t border-white/20">
              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <button onClick={() => setShowEmoji(!showEmoji)} className="text-neutral-400 hover:text-white flex items-center gap-2">
                    <Smile className="w-5 h-5" />
                    <span className="text-sm hidden sm:inline">Emoji</span>
                  </button>
                  <label className="flex items-center gap-2 cursor-pointer text-neutral-400 hover:text-white">
                    <ImagePlus className="w-5 h-5" />
                    <span className="text-sm hidden sm:inline">Image</span>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) =>
                        setNewImages((prev) =>
                          e.target.files ? [...prev, ...Array.from(e.target.files)] : prev
                        )
                      }
                    />
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-neutral-400 hover:text-white">
                    <VideoIcon className="w-5 h-5" />
                    <span className="text-sm hidden sm:inline">Video</span>
                    <Input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) setNewVideo(file)
                      }}
                    />
                  </label>
                </div>
                <Button
                  onClick={handlePost}
                  disabled={posting || !newContent.trim()}
                  className="bg-white text-black hover:bg-neutral-200"
                >
                  {posting ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
