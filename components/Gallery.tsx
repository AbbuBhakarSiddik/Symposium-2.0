"use client";

import { useState } from "react";
import { GalleryItem, DEFAULT_GALLERY_ITEMS } from "@/lib/db";

const gradientStyles = [
  "from-cyber-cyan/30 to-cyber-purple/30",
  "from-cyber-magenta/30 to-cyber-cyan/30",
  "from-cyber-purple/30 to-cyber-magenta/30",
  "from-cyber-cyan/20 to-cyber-magenta/20",
  "from-cyber-magenta/20 to-cyber-purple/20",
  "from-cyber-cyan/40 to-cyber-purple/20",
  "from-cyber-magenta/40 to-cyber-cyan/20",
  "from-cyber-purple/40 to-cyber-magenta/20",
];

type GalleryProps = {
  items?: GalleryItem[];
};

function getEmbedUrl(url: string) {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
  }
  return null;
}

function getVideoThumbnail(url: string) {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
  }
  return null;
}

export default function Gallery({ items = [] }: GalleryProps) {
  const activeItems = items.length > 0 ? items : DEFAULT_GALLERY_ITEMS;

  const photos = activeItems.filter((i) => i.type === "photo");
  const videos = activeItems.filter((i) => i.type === "video");

  // Fallback defaults if photos or videos are empty
  const displayPhotos = photos.length > 0 ? photos : DEFAULT_GALLERY_ITEMS.filter((i) => i.type === "photo");
  const displayVideos = videos.length > 0 ? videos : DEFAULT_GALLERY_ITEMS.filter((i) => i.type === "video");

  // Duplicate photos for smooth infinite marquee continuous scrolling
  const duplicatedPhotos = [...displayPhotos, ...displayPhotos];

  // Active Lightbox / Video Modal state
  const [activePhoto, setActivePhoto] = useState<GalleryItem | null>(null);
  const [activeVideo, setActiveVideo] = useState<GalleryItem | null>(null);

  return (
    <section id="gallery" className="border-t border-white/5 bg-ink-surface/30 section-spacing relative">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="text-center mb-16">
          <p className="eyebrow mb-2">Archive</p>
          <h2 className="section-heading mb-4">Previous Editions &amp; Gallery</h2>
          <p className="mx-auto max-w-2xl text-sm text-muted">
            Photos and recap videos from past symposiums — a glimpse of the energy, innovation, and memories we build every year.
          </p>
        </div>

        {/* ===== PHOTO CAROUSEL – Larger Dimensions & Continuous Auto-Slide ===== */}
        <div className="mb-24">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-2xl font-semibold text-paper flex items-center gap-3">
              <span>📸 Symposium Gallery</span>
              <span className="text-xs font-mono text-cyber-cyan bg-cyber-cyan/10 border border-cyber-cyan/30 px-3 py-1 rounded-full font-normal">
                Continuous Marquee ({displayPhotos.length} Photos)
              </span>
            </h3>
            <span className="text-xs font-mono text-muted hidden sm:inline-block">
              Hover to pause · Click photo to expand
            </span>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl bg-ink/40">
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-ink-surface to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-ink-surface to-transparent z-10 pointer-events-none" />

            <div className="overflow-hidden py-6">
              <div
                className="flex gap-6 w-max animate-marquee-reverse hover:animate-pause"
                style={{ animationDuration: `${Math.max(25, displayPhotos.length * 5)}s` }}
              >
                {duplicatedPhotos.map((photo, index) => (
                  <div
                    key={`photo-${photo.id}-${index}`}
                    onClick={() => setActivePhoto(photo)}
                    className={`
                      group relative w-80 sm:w-[420px] md:w-[480px] aspect-[16/10] shrink-0 cursor-pointer
                      overflow-hidden rounded-2xl border border-white/10
                      bg-gradient-to-br ${gradientStyles[index % gradientStyles.length]}
                      transition-all duration-300 hover:scale-[1.03] hover:border-cyber-cyan/60 hover:shadow-glow-cyan
                    `}
                  >
                    {photo.url ? (
                      <img
                        src={photo.url}
                        alt={photo.title || `Photo ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-center p-6">
                        <span className="text-5xl opacity-60 group-hover:scale-110 transition-transform">
                          📸
                        </span>
                      </div>
                    )}

                    {/* Gradient Overlay & Captions */}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

                    <div className="absolute bottom-0 inset-x-0 p-5 font-mono text-left z-10">
                      <span className="inline-block text-[10px] uppercase tracking-widest text-cyber-cyan bg-cyber-cyan/20 border border-cyber-cyan/40 px-2.5 py-0.5 rounded-full mb-1.5 font-bold">
                        Photo {(index % displayPhotos.length) + 1}
                      </span>
                      <h4 className="text-lg font-bold text-paper font-display line-clamp-1 group-hover:text-cyber-cyan transition-colors">
                        {photo.title || `Gallery Photo ${(index % displayPhotos.length) + 1}`}
                      </h4>
                      {photo.caption && (
                        <p className="text-xs text-muted line-clamp-1 mt-1 font-sans">
                          {photo.caption}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ===== VIDEO SECTION – Larger 2-Column Cards & Interactive Player ===== */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-display text-2xl font-semibold text-paper flex items-center gap-3">
              <span>🎬 Recap &amp; Highlights</span>
              <span className="text-xs font-mono text-cyber-magenta bg-cyber-magenta/10 border border-cyber-magenta/30 px-3 py-1 rounded-full font-normal">
                {displayVideos.length} Videos
              </span>
            </h3>
            <span className="text-xs font-mono text-muted hidden sm:inline-block">
              Click video to watch recap
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {displayVideos.map((video, index) => {
              const thumb = getVideoThumbnail(video.url) || video.url;
              return (
                <div
                  key={`video-${video.id}-${index}`}
                  onClick={() => setActiveVideo(video)}
                  className={`
                    group relative aspect-video overflow-hidden rounded-3xl border border-white/10
                    bg-gradient-to-br ${gradientStyles[(index + 3) % gradientStyles.length]}
                    transition-all duration-300 hover:scale-[1.02] hover:border-cyber-cyan/60 hover:shadow-glow-cyan
                    flex flex-col justify-end p-6 sm:p-8 cursor-pointer shadow-xl
                  `}
                >
                  {/* Thumbnail Image */}
                  {thumb && (
                    <img
                      src={thumb}
                      alt={video.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60 group-hover:opacity-80"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-white/80 bg-black/40 backdrop-blur-md flex items-center justify-center group-hover:border-cyber-cyan group-hover:bg-cyber-cyan/20 group-hover:scale-110 transition-all shadow-glow-cyan">
                      <svg className="w-8 h-8 text-white group-hover:text-cyber-cyan ml-1 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>

                  {/* Video Details */}
                  <div className="relative z-10">
                    <span className="inline-block text-[11px] uppercase tracking-widest text-cyber-magenta bg-cyber-magenta/20 border border-cyber-magenta/40 px-3 py-1 rounded-full font-mono font-bold mb-2">
                      Recap Video #{index + 1}
                    </span>
                    <h4 className="font-display text-xl sm:text-2xl font-bold text-paper group-hover:text-cyber-cyan transition-colors line-clamp-1">
                      {video.title || `Recap Video ${index + 1}`}
                    </h4>
                    {video.caption && (
                      <p className="text-xs sm:text-sm text-muted line-clamp-2 mt-1 font-sans">
                        {video.caption}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <a
              href="#contact"
              className="btn-cyber inline-flex px-8 py-3 text-sm font-bold"
            >
              View Full Event Album &amp; Socials
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* ===== PHOTO LIGHTBOX MODAL ===== */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-8 backdrop-blur-xl animate-fade-in"
          onClick={() => setActivePhoto(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center bg-ink-surface/90 border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 z-20 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full w-10 h-10 flex items-center justify-center font-mono text-lg transition"
            >
              ✕
            </button>

            {activePhoto.url ? (
              <img
                src={activePhoto.url}
                alt={activePhoto.title}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-2xl shadow-lg"
              />
            ) : (
              <div className="h-64 w-full flex items-center justify-center text-6xl">📸</div>
            )}

            <div className="mt-4 text-center space-y-1">
              <h3 className="font-display text-xl font-bold text-paper">{activePhoto.title}</h3>
              {activePhoto.caption && <p className="text-sm text-muted max-w-xl">{activePhoto.caption}</p>}
            </div>
          </div>
        </div>
      )}

      {/* ===== VIDEO PLAYER MODAL ===== */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-8 backdrop-blur-xl animate-fade-in"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="relative max-w-4xl w-full flex flex-col bg-ink-surface/90 border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-4 sm:p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="font-mono text-[10px] uppercase text-cyber-magenta">Video Preview</span>
                <h3 className="font-display text-lg sm:text-xl font-bold text-paper line-clamp-1">
                  {activeVideo.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full w-10 h-10 flex items-center justify-center font-mono text-lg transition"
              >
                ✕
              </button>
            </div>

            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/10">
              {getEmbedUrl(activeVideo.url) ? (
                <iframe
                  src={getEmbedUrl(activeVideo.url)!}
                  title={activeVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : activeVideo.url ? (
                <video
                  src={activeVideo.url}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted font-mono">
                  No video stream URL found.
                </div>
              )}
            </div>

            {activeVideo.caption && (
              <p className="text-xs sm:text-sm text-muted font-sans pt-1">
                {activeVideo.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}