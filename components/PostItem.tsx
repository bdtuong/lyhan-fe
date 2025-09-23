"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, MessageCircle, Share } from "lucide-react"
import { useUserInfo } from "@/hooks/useUserInfo"
import { decodeJWT } from "@/utils/jwt"
import { toggleLike } from "@/services/post.services"
import { CommentModal } from "./CommentModal"
import { Lightbox, LightboxImage } from "@/components/lightbox"

export function PostItem({ post }: { post: any }) {
  const { userInfo } = useUserInfo(post.userID)
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : ""
  const decoded = token ? decodeJWT(token) : null
  const userId = decoded?.id

  // local state để re-render
  const [likes, setLikes] = useState<number>(post.likes?.length || 0)
  const [liked, setLiked] = useState<boolean>(post.likes?.includes(userId) || false)
  const [showModal, setShowModal] = useState(false)

  // lightbox state
  const [selectedImage, setSelectedImage] = useState<LightboxImage | null>(null)

  const handleToggleLike = async () => {
    if (!userId || !token) return
    try {
      const updatedPost = await toggleLike(post._id, userId, token)
      setLikes(updatedPost.likes.length)
      setLiked(updatedPost.likes.includes(userId))
    } catch (err) {
      console.error("❌ Like error:", err)
    }
  }

  // lấy danh sách ảnh (ưu tiên images[], fallback imageUrl)
  const images: string[] =
    post.images && post.images.length > 0
      ? post.images
      : post.imageUrl
      ? [post.imageUrl]
      : []

  // hashtags cho Lightbox
  const hashtags: string[] = Array.isArray(post.hashtags) ? post.hashtags : ["Post"]

  // build mảng LightboxImage cho Lightbox
  const lightboxImages: LightboxImage[] = images.map((src, idx) => ({
    id: idx,
    src,
    alt: `post-${idx}`,
    content: post.content || `Ảnh ${idx + 1}`,
    category: hashtags,
  }))

  return (
    <>
      <Card>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <Link href={`/profile/${post.userID}`} className="flex items-center gap-3">
              <img
                src={userInfo?.avatar || "/avatars/default.png"}
                alt={userInfo?.username || "user"}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-semibold hover:underline">
                  {userInfo?.username || "Ẩn danh"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(post.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
            </Link>
          </div>

          {/* Content */}
          <div className="mb-3 whitespace-pre-line text-sm">{post.content}</div>

          {/* Images */}
          {images.length > 0 && (
            <div className="mb-3">
              {images.length === 1 && (
                <img
                  src={images[0]}
                  alt="post-0"
                  className="w-full object-cover rounded-lg cursor-pointer"
                  onClick={() => setSelectedImage(lightboxImages[0])}
                />
              )}

              {images.length === 2 && (
                <div className="grid grid-cols-2 gap-2">
                  {lightboxImages.map((img, i) => (
                    <img
                      key={i}
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-72 object-cover rounded-lg cursor-pointer"
                      onClick={() => setSelectedImage(img)}
                    />
                  ))}
                </div>
              )}

              {images.length === 3 && (
                <div className="grid grid-cols-3 gap-2">
                  <img
                    src={lightboxImages[0].src}
                    alt={lightboxImages[0].alt}
                    className="col-span-2 h-72 object-cover rounded-lg cursor-pointer"
                    onClick={() => setSelectedImage(lightboxImages[0])}
                  />
                  <div className="flex flex-col gap-2">
                    {lightboxImages.slice(1).map((img) => (
                      <img
                        key={img.id}
                        src={img.src}
                        alt={img.alt}
                        className="h-36 object-cover rounded-lg cursor-pointer"
                        onClick={() => setSelectedImage(img)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {images.length === 4 && (
                <div className="grid grid-cols-2 gap-2">
                  {lightboxImages.map((img) => (
                    <img
                      key={img.id}
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-48 object-cover rounded-lg cursor-pointer"
                      onClick={() => setSelectedImage(img)}
                    />
                  ))}
                </div>
              )}

              {images.length > 4 && (
                <div className="grid grid-cols-2 gap-2">
                  {lightboxImages.slice(0, 4).map((img, i) => (
                    <div
                      key={img.id}
                      className="relative cursor-pointer"
                      onClick={() => setSelectedImage(img)}
                    >
                      <img
                        src={img.src}
                        alt={img.alt}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      {i === 3 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                          <span className="text-white text-2xl font-bold">
                            +{images.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <button
              onClick={handleToggleLike}
              className={`flex items-center gap-1 transition-colors ${
                liked ? "text-red-500" : "hover:text-primary"
              }`}
            >
              <Heart className="w-4 h-4" fill={liked ? "red" : "none"} />
              {likes}
            </button>
            <button
              className="flex items-center gap-1 hover:text-primary transition-colors"
              onClick={() => setShowModal(true)}
            >
              <MessageCircle className="w-4 h-4" />
              {post.commentsCount || 0}
            </button>
            <button className="flex items-center gap-1 hover:text-primary transition-colors">
              <Share className="w-4 h-4" />
              Chia sẻ
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Comment Modal */}
      {showModal && (
        <CommentModal postId={post._id} onClose={() => setShowModal(false)} />
      )}

      {/* Lightbox Preview */}
      {selectedImage && (
        <Lightbox
          image={selectedImage}
          images={lightboxImages}
          onClose={() => setSelectedImage(null)}
          onNext={(next) => setSelectedImage(next)}
          onPrevious={(prev) => setSelectedImage(prev)}
        />
      )}
    </>
  )
}
