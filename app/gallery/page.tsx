import { ImageGallery } from "@/components/image-gallery"

export default function GalleryPage() {
  return (
    <div
      className="min-h-screen bg-top bg-repeat"
      style={{
        backgroundImage: "url('/background.jpg')",
        backgroundSize: "100% auto",
      }}
    >
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Bộ Sưu Tập</h1>
            <p className="text-lg text-muted-foreground">
              Những khoảnh khắc xinh đẹp và hậu trường đặc biệt
            </p>
          </div>

          <ImageGallery />
        </div>
      </div>
    </div>
  )
}
