"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Lightbox, LightboxImage } from "@/components/lightbox"
import { Search } from "lucide-react"
import { getPosts } from "@/services/post.services"

export function ImageGallery() {
  const [images, setImages] = useState<LightboxImage[]>([])
  const [selectedImage, setSelectedImage] = useState<LightboxImage | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("Tất cả")
  const [searchTerm, setSearchTerm] = useState("")

  // ✅ Infinite scroll states
  const [page, setPage] = useState(1)
  const [pageSize] = useState(12)
  const [total, setTotal] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)
  const loaderRef = useRef<HTMLDivElement | null>(null)

  const [loadedPosts, setLoadedPosts] = useState(0) // 🆕 đếm SỐ BÀI đã tải

  // ✅ Hàm xử lý mọi dạng dữ liệu ảnh
  const extractImageUrls = (post: any): string[] => {
    let raw = post.images || post.imageUrl || []

    if (typeof raw === "string") return [raw]
    if (!Array.isArray(raw)) raw = [raw]

    return raw
      .map((img: any) => {
        if (!img) return null
        if (typeof img === "string") return img
        if (typeof img === "object") return img.url || img.src || img.link || null
        return null
      })
      .filter((src: string): src is string => typeof src === "string" && src.trim() !== "")
  }

  // ✅ Fetch post theo page
  useEffect(() => {
    let cancel = false
    setLoadingMore(true)

    getPosts(page, pageSize)
      .then((res) => {
        if (cancel) return
        const posts = res.boards || res || []

        const mapped: LightboxImage[] = posts.flatMap((post: any) => {
          const imgs = extractImageUrls(post)
          return imgs.map((img, index) => ({
            id: `${post._id}-${index}`,
            src: img,
            alt: post.content || "Không có nội dung",
            content: post.content || "Chưa có nội dung",
            category: post.hashtags || [],
          }))
        })

        setImages((prev) => (page === 1 ? mapped : [...prev, ...mapped]))
        setTotal(res.totalCount || 0)

        setLoadedPosts((prev) => (page === 1 ? posts.length : prev + posts.length)) // 🆕
        // (Optional an toàn): nếu API không ổn định, trang trả < pageSize coi như hết
        // if (!res.totalCount && posts.length < pageSize) setTotal(page === 1 ? posts.length : (prev + posts.length))
      })
      .catch((err) => console.error("❌ Lỗi load posts:", err))
      .finally(() => setLoadingMore(false))

    return () => {
      cancel = true
    }
  }, [page, pageSize])

  // ✅ IntersectionObserver để tự load tiếp
  useEffect(() => {
    const target = loaderRef.current
    if (!target) return
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first.isIntersecting && !loadingMore) {
          // 🆕 SO SÁNH THEO SỐ BÀI, KHÔNG DÙNG images.length
          if (loadedPosts < total) {
            setPage((prev) => prev + 1)
          }
        }
      },
      { threshold: 1, rootMargin: "200px" }
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [loadedPosts, total, loadingMore]) // 🆕 deps dùng loadedPosts thay vì images

  // 🟢 Gom và xếp hashtag theo tần suất
  const hashtagCounts: Record<string, number> = {}
  images.forEach((img) => {
    ;(img.category || []).forEach((tag: string) => {
      hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1
    })
  })

  const sortedHashtags = Object.keys(hashtagCounts).sort(
    (a, b) => hashtagCounts[b] - hashtagCounts[a]
  )
  const categories = ["Tất cả", ...sortedHashtags]

  // 🟢 Filter theo category + search
  const filteredImages = images.filter((img) => {
    const matchCategory =
      selectedCategory === "Tất cả"
        ? true
        : (img.category || []).includes(selectedCategory)

    const matchContent = (img.content || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchHashtag = (img.category || []).some((tag: string) =>
      (tag || "").toLowerCase().includes(searchTerm.toLowerCase())
    )

    return matchCategory && (matchContent || matchHashtag)
  })

  return (
    <section className="relative mt-4">
      {/* Search bar */}
      <div className="flex justify-center mb-6 relative z-10">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm khoảnh khắc hoặc hashtag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-8 relative z-10">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category
                ? "bg-blue-600 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {category}{" "}
            {category !== "Tất cả" && (
              <span className="ml-1 text-xs opacity-70">
                {hashtagCounts[category] || 0}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Masonry Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 relative z-10">
        {filteredImages.map((image) => (
          <Card
            key={image.id}
            className="mb-4 break-inside-avoid cursor-pointer group overflow-hidden hover:shadow-lg transition-all duration-300"
            onClick={() => setSelectedImage(image)}
          >
            <div className="relative overflow-hidden">
              <Image
                src={image.src || "/placeholder.svg"}
                alt={image.alt}
                width={400}
                height={300}
                className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-end">
                <div className="p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="font-semibold text-sm">{image.content}</h3>
                  <p className="text-xs opacity-80">
                    {(image.category || []).join(" ")}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Loader */}
      <div ref={loaderRef} className="py-10 text-center text-sm text-muted-foreground">
        {loadingMore && loadedPosts < total && <p>Đang tải thêm ảnh…</p>} {/* 🆕 */}
        {loadedPosts >= total && <p>Đã hiển thị tất cả ảnh.</p>}            {/* 🆕 */}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <Lightbox
          image={selectedImage}
          images={filteredImages}
          onClose={() => setSelectedImage(null)}
          onNext={(nextImage) => setSelectedImage(nextImage)}
          onPrevious={(prevImage) => setSelectedImage(prevImage)}
        />
      )}
    </section>
  )
}
