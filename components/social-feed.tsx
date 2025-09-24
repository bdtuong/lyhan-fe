"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { ImagePlus, X, Smile, Search, Menu, Home, User, Plus } from "lucide-react"
import { decodeJWT } from "@/utils/jwt"
import { getUser } from "@/services/auth.services"
import { getPosts, createPost, searchPosts as searchPostsAPI } from "@/services/post.services"
import { PostItem } from "@/components/PostItem"
import { LyhanLoading } from "@/components/ui/loading"
import EmojiPicker from "emoji-picker-react"

type SearchUser = { _id: string; username: string; avatar?: string }
type SearchPost = any

export function FanSocialPage() {
  const router = useRouter()

  const [posts, setPosts] = useState<any[]>([])
  const [newContent, setNewContent] = useState("")
  const [newImages, setNewImages] = useState<File[]>([])
  const [posting, setPosting] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

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
      setShowCreateModal(false)
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
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-16 xl:w-20
                  bg-black/90 backdrop-blur-lg border-r border-blue-500/20
                  flex-col items-center gap-2 py-4">

        <div className="h-10 w-full mt-12" />
        <button
          onClick={() => setShowSearch(true)}
          className="group w-11 h-11 rounded-xl flex items-center justify-center text-neutral-200 hover:bg-blue-500/10 hover:border-blue-500/30 border border-transparent transition-all duration-200"
          aria-label="Tìm kiếm"
          title="Tìm kiếm"
        >
          <Search className="w-6 h-6" />
        </button>
        <button
          onClick={() => setShowCreateModal(true)}
          className="group w-11 h-11 rounded-xl flex items-center justify-center text-neutral-200 hover:bg-blue-500/10 hover:border-blue-500/30 border border-transparent transition-all duration-200"
          aria-label="Tạo bài viết"
          title="Tạo bài viết"
        >
          <Plus className="w-6 h-6" />
        </button>
      </aside>

      {/* MOBILE BOTTOM NAV - SAFE AREA VERSION */}
<nav
  className="lg:hidden fixed bottom-0 left-0 right-0 z-50
             bg-black/90 backdrop-blur-lg border-t border-blue-500/20
             pb-[env(safe-area-inset-bottom)]"
>
  <div className="flex justify-around items-center max-w-md mx-auto h-14">
    <button className="flex flex-col items-center justify-center gap-0.5 text-neutral-200 hover:text-blue-400 transition-colors">
      <Home className="w-6 h-6" />
      <span className="text-xs">Home</span>
    </button>

    <button onClick={() => setShowSearch(true)}
      className="flex flex-col items-center justify-center gap-0.5 text-neutral-200 hover:text-blue-400 transition-colors">
      <Search className="w-6 h-6" />
      <span className="text-xs">Search</span>
    </button>

    <button onClick={() => setShowCreateModal(true)}
      className="flex flex-col items-center justify-center gap-0.5 text-neutral-200 hover:text-blue-400 transition-colors">
      <Plus className="w-6 h-6" />
      <span className="text-xs">Create</span>
    </button>

    <button className="flex flex-col items-center justify-center gap-0.5 text-neutral-200 hover:text-blue-400 transition-colors">
      <User className="w-6 h-6" />
      <span className="text-xs">Profile</span>
    </button>
  </div>
</nav>



      {/* PAGE CONTENT */}
      <main className="lg:pl-16 xl:pl-20 pb-20 lg:pb-0">
        <div className="max-w-2xl mx-auto py-4 lg:py-12 px-4">
          {/* DESKTOP POST COMPOSER */}
          <Card className="mb-8 hidden lg:block bg-black/40 backdrop-blur-sm border-blue-500/20">
            <CardContent className="p-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full flex gap-3 items-center p-4 rounded-xl bg-neutral-900/50 hover:bg-neutral-800/50 border border-blue-500/10 hover:border-blue-500/20 transition-all duration-200"
              >
                <img src={avatar} alt="me" className="w-10 h-10 rounded-full" />
                <span className="text-neutral-400 text-left flex-1">Viết cảm nghĩ của bạn về Lyhan...</span>
                <ImagePlus className="w-6 h-6 text-neutral-500" />
              </button>
            </CardContent>
          </Card>

          {/* MOBILE POST COMPOSER */}
          <Card className="mb-4 lg:hidden bg-black/40 backdrop-blur-sm border-blue-500/20">
            <CardContent className="p-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full flex gap-3 items-center p-3 rounded-xl bg-neutral-900/50 hover:bg-neutral-800/50 border border-blue-500/10 hover:border-blue-500/20 transition-all duration-200"
              >
                <img src={avatar} alt="me" className="w-8 h-8 rounded-full" />
                <span className="text-neutral-400 text-left flex-1 text-sm">Bạn đang nghĩ gì?</span>
                <Plus className="w-5 h-5 text-neutral-500" />
              </button>
            </CardContent>
          </Card>

          {/* SEARCH MODE INDICATOR */}
          {mode === "search" && (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-sm text-blue-300">Đang hiển thị kết quả tìm kiếm ({displayPosts.length})</p>
              <Button variant="outline" size="sm" onClick={clearSearchMode} className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10">
                Trở lại feed
              </Button>
            </div>
          )}

          {/* POSTS */}
          <div className="space-y-4 lg:space-y-6">
            {displayPosts.map((post) => (
              <PostItem key={post._id} post={post} />
            ))}
          </div>

          {/* INFINITE SCROLL LOADER */}
          {mode === "feed" && (
            <div ref={loaderRef} className="flex justify-center py-10">
              {loadingMore && posts.length < total && <LyhanLoading size="lg" color="blue" />}
              {posts.length >= total && <p className="text-gray-400 text-sm">Đã tải hết bài viết</p>}
            </div>
          )}
        </div>
      </main>

      {/* CREATE POST MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          />
          
          {/* Modal */}
          <div className="relative w-full max-w-lg bg-black/90 backdrop-blur-lg rounded-2xl border border-blue-500/30 shadow-2xl shadow-blue-500/10 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-blue-500/20">
              <h2 className="font-semibold text-lg text-white">Tạo bài viết</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full hover:bg-neutral-800/50 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* User Info */}
              <div className="flex items-center gap-3">
                <img src={avatar} alt="me" className="w-10 h-10 rounded-full" />
                <span className="font-medium text-white">{username}</span>
              </div>

              {/* Text Area */}
              <Textarea
                placeholder="Viết cảm nghĩ của bạn về Lyhan..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="min-h-32 bg-transparent border-blue-500/20 focus:border-blue-500/40 text-white placeholder:text-neutral-400 resize-none"
                autoFocus
              />

              {/* Image Previews */}
              {newImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {newImages.map((file, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`preview-${i}`}
                        className="w-full aspect-square object-cover rounded-lg border border-blue-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => setNewImages(newImages.filter((_, idx) => idx !== i))}
                        className="absolute -top-2 -right-2 bg-black/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Emoji Picker */}
              {showEmoji && (
                <div className="border border-blue-500/20 rounded-lg overflow-hidden">
                  <EmojiPicker 
                    onEmojiClick={onEmojiClick}
                    width="100%"
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-blue-500/20">
              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowEmoji(!showEmoji)}
                    className="flex items-center gap-2 text-neutral-400 hover:text-blue-400 transition-colors"
                  >
                    <Smile className="w-5 h-5" />
                    <span className="text-sm hidden sm:inline">Emoji</span>
                  </button>

                  <label className="flex items-center gap-2 cursor-pointer text-neutral-400 hover:text-blue-400 transition-colors">
                    <ImagePlus className="w-5 h-5" />
                    <span className="text-sm hidden sm:inline">Ảnh</span>
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
                </div>

                <Button 
                  onClick={handlePost} 
                  disabled={posting || !newContent.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed border-0"
                >
                  {posting ? "Đang đăng..." : "Đăng"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEARCH PANEL */}
      {showSearch && (
        <div className="fixed inset-0 lg:flex">
          {/* Desktop: panel bên trái của sidebar */}
          <div className="hidden lg:block lg:ml-16 xl:ml-20 w-80 bg-black/90 backdrop-blur-lg h-full shadow-2xl border-r border-blue-500/20 animate-in slide-in-from-left duration-200">
            <div className="p-4 mt-24">
              <div className="flex justify-between items-center mb-4 ">
                <h2 className="font-bold text-lg text-white">Tìm kiếm</h2>
                <button 
                  onClick={() => setShowSearch(false)}
                  className="w-8 h-8 rounded-full hover:bg-neutral-800/50 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative mb-4">
                <Input
                  placeholder="Tìm bài viết, tài khoản..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="pr-10 bg-neutral-900/50 border-blue-500/20 focus:border-blue-500/40 text-white"
                  autoFocus
                />
                <Search className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>

              {/* Search Results */}
              <div className="overflow-y-auto max-h-[calc(100vh-140px)] space-y-6">
                {/* Accounts */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-white">Tài khoản</p>
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
                    <p className="text-sm text-neutral-400">Đang tìm tài khoản…</p>
                  ) : searchUsers.length ? (
                    <div className="space-y-2">
                      {searchUsers.slice(0, 8).map((u) => (
                        <button
                          key={u._id}
                          className="w-full flex gap-3 items-center p-2 hover:bg-neutral-800/30 rounded-lg text-left border border-transparent hover:border-blue-500/20 transition-all duration-200"
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
                            <p className="font-medium leading-5 text-white">{u.username}</p>
                            <p className="text-xs text-neutral-400">Đi tới trang cá nhân</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : keyword ? (
                    <p className="text-sm text-neutral-400">Không tìm thấy tài khoản phù hợp</p>
                  ) : (
                    <p className="text-sm text-neutral-400">Nhập từ khóa để tìm tài khoản</p>
                  )}
                </div>

                {/* Posts */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-white">Bài viết</p>
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
                    <p className="text-sm text-neutral-400">Đang tìm bài viết…</p>
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
                            className="relative group aspect-square overflow-hidden rounded-md bg-neutral-800 border border-blue-500/10 hover:border-blue-500/30 transition-all duration-200"
                            onClick={() => enterSearchModeWithPosts([p])}
                            title={p.title || p.content}
                          >
                            <img
                              src={img}
                              alt="post"
                              className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-200"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200" />
                            <span className="sr-only">{u.username || "post"} - open</span>
                          </button>
                        ))
                      })}
                    </div>
                  ) : keyword ? (
                    <p className="text-sm text-neutral-400">Không có bài viết phù hợp</p>
                  ) : (
                    <p className="text-sm text-neutral-400">Nhập từ khóa để tìm bài viết</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile: full screen overlay */}
          <div className="lg:hidden fixed inset-0 bg-black/95 backdrop-blur-lg">
            <div className="p-4 mt-24">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg text-white">Tìm kiếm</h2>
                <button 
                  onClick={() => setShowSearch(false)}
                  className="w-8 h-8 rounded-full hover:bg-neutral-800/50 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative mb-4">
                <Input
                  placeholder="Tìm bài viết, tài khoản..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="pr-10 bg-neutral-900/50 border-blue-500/20 focus:border-blue-500/40 text-white"
                  autoFocus
                />
                <Search className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>

              {/* Mobile Search Results - Similar structure but optimized for mobile */}
              <div className="overflow-y-auto max-h-[calc(100vh-140px)] space-y-6">
                {/* Mobile Accounts */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-white">Tài khoản</p>
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
                    <p className="text-sm text-neutral-400">Đang tìm tài khoản…</p>
                  ) : searchUsers.length ? (
                    <div className="space-y-2">
                      {searchUsers.slice(0, 8).map((u) => (
                        <button
                          key={u._id}
                          className="w-full flex gap-3 items-center p-3 hover:bg-neutral-800/30 rounded-lg text-left border border-transparent hover:border-blue-500/20 transition-all duration-200"
                          onClick={() => {
                            setShowSearch(false)
                            router.push(`/profile/${u._id}`)
                          }}
                        >
                          <img
                            src={u.avatar || "/avatars/default.png"}
                            alt={u.username}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium leading-5 text-white">{u.username}</p>
                            <p className="text-xs text-neutral-400">Đi tới trang cá nhân</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : keyword ? (
                    <p className="text-sm text-neutral-400">Không tìm thấy tài khoản phù hợp</p>
                  ) : (
                    <p className="text-sm text-neutral-400">Nhập từ khóa để tìm tài khoản</p>
                  )}
                </div>

                {/* Mobile Posts */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-white">Bài viết</p>
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
                    <p className="text-sm text-neutral-400">Đang tìm bài viết…</p>
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
                            className="relative group aspect-square overflow-hidden rounded-md bg-neutral-800 border border-blue-500/10 hover:border-blue-500/30 transition-all duration-200"
                            onClick={() => enterSearchModeWithPosts([p])}
                            title={p.title || p.content}
                          >
                            <img
                              src={img}
                              alt="post"
                              className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-200"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200" />
                            <span className="sr-only">{u.username || "post"} - open</span>
                          </button>
                        ))
                      })}
                    </div>
                  ) : keyword ? (
                    <p className="text-sm text-neutral-400">Không có bài viết phù hợp</p>
                  ) : (
                    <p className="text-sm text-neutral-400">Nhập từ khóa để tìm bài viết</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Desktop overlay (chỉ hiển thị phần còn lại) */}
          <div className="hidden lg:block flex-1 bg-black/40" onClick={() => setShowSearch(false)} />
        </div>
      )}
    </>
  )
}