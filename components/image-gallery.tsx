"use client";

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { getPosts } from "@/services/post.services";
import Masonry from "@/components/ui/masonry-grid";
import { Lightbox } from "@/components/lightbox";

export function ImageGallery() {
  const [images, setImages] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState<any | null>(null);

  // Infinite scroll states
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const [loadedPosts, setLoadedPosts] = useState(0);

  // helper: get natural image size
  async function getImageSize(src: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.src = src;
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
    });
  }

  // fetch posts
  useEffect(() => {
    let cancel = false;
    setLoadingMore(true);

    getPosts(page, pageSize)
      .then(async (res) => {
        if (cancel) return;
        const posts = res.boards || res || [];

        const mapped = await Promise.all(
          posts.flatMap(async (post: any) => {
            const raw = post.images || post.imageUrl || [];
            const arr = Array.isArray(raw) ? raw : [raw];
            const valid = arr.filter(Boolean);

            return Promise.all(
              valid.map(async (src: string, index: number) => {
                const { width, height } = await getImageSize(src);
                return {
                  id: `${post._id}-${index}`,
                  img: src, // used for Masonry
                  url: "#",
                  content: post.content || "",
                  category: post.hashtags || [],
                  width,
                  height,
                };
              })
            );
          })
        );

        const flat = mapped.flat();
        setImages((prev) => (page === 1 ? flat : [...prev, ...flat]));
        setTotal(res.totalCount || 0);
        setLoadedPosts((prev) => (page === 1 ? posts.length : prev + posts.length));
      })
      .finally(() => setLoadingMore(false));

    return () => {
      cancel = true;
    };
  }, [page, pageSize]);

  // intersection observer
  useEffect(() => {
    const target = loaderRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !loadingMore) {
          if (loadedPosts < total) {
            setPage((prev) => prev + 1);
          }
        }
      },
      { threshold: 1, rootMargin: "200px" }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [loadedPosts, total, loadingMore]);

  // hashtag filter
  const hashtagCounts: Record<string, number> = {};
  images.forEach((img) => {
    (img.category || []).forEach((tag: string) => {
      hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
    });
  });

  const sortedHashtags = Object.keys(hashtagCounts).sort(
    (a, b) => hashtagCounts[b] - hashtagCounts[a]
  );
  const categories = ["All", ...sortedHashtags];

  const filteredImages = images.filter((img) => {
    const matchCategory =
      selectedCategory === "All"
        ? true
        : (img.category || []).includes(selectedCategory);

    const matchContent = (img.content || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchHashtag = (img.category || []).some((tag: string) =>
      (tag || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return matchCategory && (matchContent || matchHashtag);
  });

  return (
    <section className="relative mt-4">
      {/* Search + Filter */}
      <div className="max-w-6xl mx-auto mb-8 px-4">
        {/* Search full width */}
        <div className="relative w-full mb-4">
          {/* Icon Search */}
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5 z-10" />

          {/* Input */}
          <input
            type="text"
            placeholder="Search for photos or hashtags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl 
                      bg-white/5 backdrop-blur-md text-white 
                      placeholder-gray-400 
                      focus:outline-none focus:ring-2 focus:white
                      shadow-lg transition-all duration-200"
          />
        </div>

        {/* Hashtag chips */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? "bg-white text-black shadow"
                  : "bg-white/10 text-gray-200 hover:bg-blue-500/20"
              }`}
            >
              {category}
              {category !== "All" && (
                <span className="ml-1 text-xs opacity-70">
                  {hashtagCounts[category] || 0}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Masonry Grid */}
      <Masonry
        items={filteredImages}
        animateFrom="bottom"
        ease="power3.out"
        duration={0.6}
        stagger={0.05}
        scaleOnHover
        blurToFocus
        colorShiftOnHover
        onItemClick={(item) =>
          setSelectedImage({
            id: item.id,
            src: item.img,          // convert img -> src for Lightbox
            alt: item.content || "",
            content: item.content,
            category: item.category || [],
          })
        }
      />

      {/* Loader */}
      <div ref={loaderRef} className="py-10 text-center text-sm text-muted-foreground">
        {loadingMore && loadedPosts < total && <p>Loading more photos…</p>}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <Lightbox
          image={selectedImage}
          images={filteredImages.map((img) => ({
            id: img.id,
            src: img.img,
            alt: img.content || "",
            content: img.content,
            category: img.category || [],
          }))}
          onClose={() => setSelectedImage(null)}
          onNext={(nextImage) => setSelectedImage(nextImage)}
          onPrevious={(prevImage) => setSelectedImage(prevImage)}
        />
      )}
    </section>
  );
}
