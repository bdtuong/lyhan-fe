"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { ImagePlus, X, Smile, Search } from "lucide-react"
import { decodeJWT } from "@/utils/jwt"
import { getUser } from "@/services/auth.services"
import { getPosts, createPost, searchPosts as searchPostsAPI } from "@/services/post.services"
import { PostItem } from "@/components/PostItem"
import { LyhanLoading } from "@/components/ui/loading"
import EmojiPicker from "emoji-picker-react"

type SearchUser = { _id: string; username: string; avatar?: string }
type SearchPost = any

// Chiều rộng sidebar cố định (phải đồng bộ các giá trị [72px] bên dưới)
const SIDEBAR_W = "w-[72px]"
const SIDEBAR_LEFT = "left-[72px]"
const PAGE_PAD_LEFT = "pl-[72px]"

export function FanSocialPage() {
  const router = useRouter()

  const [posts, setPosts] = useState<any[]>([])
  const [newContent, setNewContent] = useState("")
  const [newImages, setNewImages] = useState<File[]>([])
  const [posting, setPosting] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)

  // search state
  const [showSearch, setShowSearch] = useState(false)
  const [keyword, setKeyword] = useState("")
  const [debounced, setDebounced] = useState("")
  const [searching, setSearching] = useState(false)
  const [searchUsers, setSearchUsers] = useState<SearchUser[]>([])
  const [searchPosts, setSearchPosts] = useState<SearchPost[]>([])

  // viewing mode
  const [mode, setMode] = useState<"feed" | "search">("feed")

  // user info
  const [userId, setUserId] = useState("")
  const [username, setUsername] = useState("Bạn")
  const [avatar, setAvatar] = useState("/avatars/default.png")

  // infinite scroll
  const [page, setPage] = useState(1)
  const [pageSize] = useState(5)
  const [total, setTotal] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)
  const loaderRef = useRef<HTMLDivElement | null>(null)

  // lấy user info từ token
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return
    const decoded = decodeJWT(token)
    if (!decoded?.id) return
    setUserId(decoded.id)

    getUser(decoded.id, token)
      .then((data) => {
        setUsername(data.username || "Bạn")
        setAvatar(
          Array.isArray(data.avatar) ? data.avatar[0] : data.avatar || "/avatars/default.png"
        )
      })
      .catch((err) => console.error("❌ Lỗi getUser:", err))
  }, [])

  // fetch posts (feed mode)
  useEffect(() => {
    if (mode !== "feed") return
    let cancel = false
    setLoadingMore(true)

    getPosts(page, pageSize)
      .then((data) => {
        if (!cancel) {
          setPosts((prev) => (page === 1 ? data.boards || [] : [...prev, ...(data.boards || [])]))
          setTotal(data.totalCount || 0)
        }
      })
      .catch((err) => console.error("❌ Lỗi fetch posts:", err))
      .finally(() => setLoadingMore(false))

    return () => {
      cancel = true
    }
  }, [page, pageSize, mode])

  // observer (chỉ bật ở feed mode)
  useEffect(() => {
    if (mode !== "feed") return
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
  }, [posts, total, loadingMore, mode])

  // đăng post mới
  const handlePost = async () => {
    if (!newContent.trim() || !userId) return
    setPosting(true)
    try {
      const token = localStorage.getItem("token") || ""
      const newPost = await createPost(
        {
          title: newContent.slice(0, 20),
          description: newContent,
          language: "vi",
          content: newContent,
          userId,
          images: newImages
        },
        token
      )
      setPosts((prev) => [newPost, ...prev])
      setNewContent("")
      setNewImages([])
    } catch (err) {
      console.error("❌ Upload thất bại:", err)
    } finally {
      setPosting(false)
    }
  }

  // emoji
  const onEmojiClick = (emojiData: any) => {
    setNewContent((prev) => prev + emojiData.emoji)
    setShowEmoji(false)
  }

  // debounce keyword
  useEffect(() => {
    const t = setTimeout(() => setDebounced(keyword.trim()), 350)
    return () => clearTimeout(t)
  }, [keyword])

  // call BE search
  useEffect(() => {
    const run = async () => {
      if (!debounced) {
        setSearchUsers([])
        setSearchPosts([])
        return
      }
      setSearching(true)
      try {
        const data = await searchPostsAPI(debounced)
        const postsArr: any[] = Array.isArray(data) ? data : []
        setSearchPosts(postsArr)

        const usersMap = new Map<string, SearchUser>()
        for (const p of postsArr) {
          const u = p.userInfo || {}
          const id = (u._id || p.userID || p.userId || "").toString()
          const name = u.username || p.username
          if (id && name && !usersMap.has(id)) {
            usersMap.set(id, {
              _id: id,
              username: name,
              avatar: Array.isArray(u.avatar) ? u.avatar[0] : u.avatar
            })
          }
        }
        setSearchUsers(Array.from(usersMap.values()))
      } catch (e) {
        console.error("search error:", e)
        setSearchPosts([])
        setSearchUsers([])
      } finally {
        setSearching(false)
      }
    }
    run()
  }, [debounced])

  const displayPosts = useMemo(() => (mode === "search" ? searchPosts : posts), [mode, searchPosts, posts])

  const enterSearchModeWithPosts = (items: any[]) => {
    setMode("search")
    setSearchPosts(items)
    setShowSearch(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const clearSearchMode = () => {
    setMode("feed")
    setShowSearch(false)
    setKeyword("")
    setSearchPosts([])
    setSearchUsers([])
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <>
      {/* LEFT SIDEBAR — nền đen, line phân cách, bám sát trái */}
      <aside
        className={`fixed inset-y-0 left-0 ${SIDEBAR_W} z-50 bg-black border-r border-neutral-800 flex flex-col items-center gap-2 py-4`}
      >
        {/* Logo/spacing */}
        <div className="h-10 w-full" />

        {/* Nút Search */}
        <button
          onClick={() => setShowSearch(true)}
          className="group w-11 h-11 rounded-xl flex items-center justify-center text-neutral-200 hover:bg-neutral-900"
          aria-label="Tìm kiếm"
          title="Tìm kiếm"
        >
          <Search className="w-6 h-6" />
        </button>
      </aside>

      {/* PAGE CONTENT (đẩy nội dung sang phải đúng bằng chiều rộng sidebar) */}
      <section className={`${PAGE_PAD_LEFT} max-w-2xl mx-auto py-12 px-4 relative`}>
        {/* Post Composer */}
        <Card className="mb-8">
          <CardContent className="p-4 overflow-visible">
            <div className="flex gap-3">
              <img src={avatar} alt="me" className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <Textarea
                  placeholder="Viết cảm nghĩ của bạn về Lyhan..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="mb-3"
                  rows={3}
                />

                {newImages.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-3">
                    {newImages.map((file, i) => (
                      <div key={i} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`preview-${i}`}
                          className="w-24 h-24 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => setNewImages(newImages.filter((_, idx) => idx !== i))}
                          className="absolute -top-2 -right-2 bg-black/70 text-white rounded-full p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-3 items-center text-sm text-muted-foreground">
                      <button
                        type="button"
                        onClick={() => setShowEmoji(!showEmoji)}
                        className="flex items-center gap-1 hover:text-primary"
                      >
                        <Smile className="w-5 h-5" />
                        Emoji
                      </button>

                      <label className="flex items-center gap-1 cursor-pointer">
                        <ImagePlus className="w-5 h-5" />
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
                        Ảnh
                      </label>
                    </div>

                    <Button size="sm" onClick={handlePost} disabled={posting}>
                      {posting ? "Đang đăng..." : "Đăng"}
                    </Button>
                  </div>

                  {showEmoji && (
                    <div className="mt-2">
                      <EmojiPicker onEmojiClick={onEmojiClick} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {mode === "search" && (
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-slate-600">Đang hiển thị kết quả tìm kiếm ({displayPosts.length})</p>
            <Button variant="outline" size="sm" onClick={clearSearchMode}>
              Trở lại feed
            </Button>
          </div>
        )}

        <div className="space-y-6">
          {displayPosts.map((post) => (
            <PostItem key={post._id} post={post} />
          ))}
        </div>

        {mode === "feed" && (
          <div ref={loaderRef} className="flex justify-center py-10">
            {loadingMore && posts.length < total && <LyhanLoading size="lg" color="blue" />}
            {posts.length >= total && <p className="text-gray-400 text-sm">Đã tải hết bài viết</p>}
          </div>
        )}
      </section>

      {/* SEARCH PANEL — mở sang phải của sidebar, overlay không che sidebar */}
      {showSearch && (
        <div className={`fixed inset-y-0 ${SIDEBAR_LEFT} right-0 z-50 flex`}>
          {/* panel */}
          <div className="w-[360px] max-w-[90vw] bg-black text-white h-full shadow-2xl p-4 border-r border-neutral-800 animate-[slideFromLeft_.18s_ease]">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold text-lg">Tìm kiếm</h2>
              <button onClick={() => setShowSearch(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="relative">
              <Input
                placeholder="Tìm bài viết, tài khoản, hashtag..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="pr-9 text-white"
                autoFocus
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* results */}
            <div className="overflow-y-auto max-h-[75vh] mt-4 space-y-5">
              {/* Accounts */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold">Accounts</p>
                  {searchUsers.length > 0 && (
                    <button
                      className="text-xs text-blue-400 hover:underline"
                      onClick={() => {
                        const ids = new Set(searchUsers.map((u) => u._id))
                        const list = searchPosts.filter((p) =>
                          ids.has((p.userID || p.userId || p.userInfo?._id || "").toString())
                        )
                        enterSearchModeWithPosts(list)
                      }}
                    >
                      Xem tất cả
                    </button>
                  )}
                </div>
                {searching && keyword ? (
                  <p className="text-sm text-slate-400">Đang tìm tài khoản…</p>
                ) : searchUsers.length ? (
                  <div className="space-y-2">
                    {searchUsers.slice(0, 8).map((u) => (
                      <button
                        key={u._id}
                        className="w-full flex gap-3 items-center p-2 hover:bg-neutral-900 rounded-lg text-left"
                        onClick={() => {
                          setShowSearch(false)
                          router.push(`/profile/${u._id}`)
                        }}
                      >
                        <img
                          src={u.avatar || "/avatars/default.png"}
                          alt={u.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium leading-5">{u.username}</p>
                          <p className="text-xs text-slate-400">Đi tới trang cá nhân</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : keyword ? (
                  <p className="text-sm text-slate-400">Không tìm thấy tài khoản phù hợp</p>
                ) : (
                  <p className="text-sm text-slate-400">Nhập từ khóa để tìm tài khoản</p>
                )}
              </div>

              {/* Posts */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold">Posts</p>
                  {searchPosts.length > 1 && (
                    <button
                      className="text-xs text-blue-400 hover:underline"
                      onClick={() => enterSearchModeWithPosts(searchPosts)}
                    >
                      Xem tất cả
                    </button>
                  )}
                </div>

                {searching && keyword ? (
                  <p className="text-sm text-slate-400">Đang tìm bài viết…</p>
                ) : searchPosts.length ? (
                  <div className="grid grid-cols-3 gap-2">
                    {searchPosts.slice(0, 9).flatMap((p) => {
                      const imgs: string[] = Array.isArray(p.images)
                        ? p.images
                        : p.imageUrl
                        ? [p.imageUrl]
                        : []
                      if (imgs.length === 0) return []
                      const u = p.userInfo || {}
                      return imgs.map((img, idx) => (
                        <button
                          key={`${p._id}-${idx}`}
                          className="relative group aspect-square overflow-hidden rounded-md bg-neutral-800"
                          onClick={() => enterSearchModeWithPosts([p])}
                          title={p.title || p.content}
                        >
                          <img
                            src={img}
                            alt="post"
                            className="w-full h-full object-cover group-hover:scale-[1.02] transition"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition" />
                          <span className="sr-only">{u.username || "post"} - open</span>
                        </button>
                      ))
                    })}
                  </div>
                ) : keyword ? (
                  <p className="text-sm text-slate-400">Không có bài viết phù hợp</p>
                ) : (
                  <p className="text-sm text-slate-400">Nhập từ khóa để tìm bài viết</p>
                )}
              </div>
            </div>
          </div>

          {/* overlay */}
          <div className="flex-1 bg-black/40" onClick={() => setShowSearch(false)} />
        </div>
      )}
    </>
  )
}
