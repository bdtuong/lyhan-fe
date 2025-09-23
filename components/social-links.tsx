"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

const socialPlatforms = [
  {
    name: "Instagram",
    handle: "@artistname",
    followers: "2.5M",
    description: "Behind-the-scenes photos and daily updates",
    url: "https://instagram.com/artistname",
    color: "bg-gradient-to-r from-purple-500 to-pink-500",
    icon: "📸",
  },
  {
    name: "YouTube",
    handle: "@ArtistNameOfficial",
    followers: "1.8M",
    description: "Music videos, live performances, and vlogs",
    url: "https://youtube.com/@artistnameofficial",
    color: "bg-red-500",
    icon: "🎥",
  },
  {
    name: "TikTok",
    handle: "@artistname",
    followers: "3.2M",
    description: "Short videos, challenges, and fun content",
    url: "https://tiktok.com/@artistname",
    color: "bg-black",
    icon: "🎵",
  },
  {
    name: "Twitter",
    handle: "@artistname",
    followers: "1.2M",
    description: "Real-time updates and fan interactions",
    url: "https://twitter.com/artistname",
    color: "bg-blue-500",
    icon: "🐦",
  },
  {
    name: "Spotify",
    handle: "Artist Name",
    followers: "5.1M",
    description: "Latest releases and curated playlists",
    url: "https://open.spotify.com/artist/artistname",
    color: "bg-green-500",
    icon: "🎧",
  },
  {
    name: "Apple Music",
    handle: "Artist Name",
    followers: "2.8M",
    description: "Exclusive releases and high-quality audio",
    url: "https://music.apple.com/artist/artistname",
    color: "bg-gray-900",
    icon: "🍎",
  },
]

export function SocialLinks() {
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-6 text-center">Follow on Social Media</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {socialPlatforms.map((platform) => (
          <Card key={platform.name} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 ${platform.color} rounded-full flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform duration-300`}
                >
                  {platform.icon}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors bg-transparent"
                >
                  <a href={platform.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Follow
                  </a>
                </Button>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{platform.name}</h3>
                <p className="text-sm text-muted-foreground">{platform.handle}</p>
                <p className="text-sm font-medium text-primary">{platform.followers} followers</p>
                <p className="text-sm text-muted-foreground">{platform.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
