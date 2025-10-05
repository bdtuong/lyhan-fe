import { ImageGallery } from "@/components/image-gallery"

export default function GalleryPage() {
  return (
    <div>
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-6xl mx-auto">
          <ImageGallery />
        </div>
      </div>
    </div>
  )
}
