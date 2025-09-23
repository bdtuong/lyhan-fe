
import { FanSocialPage } from "@/components/social-feed"

export default function SocialsPage() {
  return (
    <div className="container mx-auto px-4 py-8 mt-24">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Socials</h1>
          <p className="text-muted-foreground text-lg">Connect with us across all social media platforms</p>
        </div>

        <div className="space-y-12">
          <FanSocialPage />
        </div>
      </div>
    </div>
  )
}
