import { ImageGallery } from "@/components/image-gallery"

export default function GalleryPage() {
  return (
    <div className="container mx-auto px-4 py-8 mt-24 lg:mt-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Bộ Sưu Tập</h1>
          <p className="text-muted-foreground text-lg">
            Những khoảnh khắc xinh đẹp và hậu trường đặc biệt
          </p>
        </div>

        <ImageGallery />
      </div>
    </div>
  )
}
