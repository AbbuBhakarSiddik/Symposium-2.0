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

  const visibleVideos = displayVideos;

  return (
    <section id="gallery" className="scroll-mt-24 border-t border-sky-200/60 bg-gradient-to-br from-[#F0F7FF] via-[#F8FAFC] to-[#F1F5F9] pt-10 pb-12 sm:pt-14 sm:pb-16 relative overflow-hidden text-slate-900 shadow-sm">
      {/* Soft Ambient Light Gradient Orbs */}
      <div
        aria-hidden="true"
        className="absolute top-[-10%] left-[-10%] w-[650px] h-[650px] rounded-full bg-sky-300/25 blur-[150px] pointer-events-none animate-pulse"
      />
      <div
        aria-hidden="true"
        className="absolute top-[40%] right-[-10%] w-[650px] h-[650px] rounded-full bg-purple-300/25 blur-[150px] pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-[-10%] left-[20%] w-[650px] h-[650px] rounded-full bg-cyan-300/25 blur-[150px] pointer-events-none"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12 flex flex-col items-center">
          <p className="eyebrow mb-3 font-mono text-xs uppercase tracking-widest text-sky-700 font-bold bg-sky-100/90 border border-sky-300/80 px-4 py-1.5 rounded-full shadow-sm">
            Archive &amp; Memories
          </p>
          <h2 className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-slate-900 mb-4">
            Previous Symposium Highlights
          </h2>
          <p className="mx-auto max-w-2xl text-base text-slate-600 font-sans leading-relaxed">
            Photos and recap videos from past symposiums — a glimpse of the energy, innovation, and memories we build every year.
          </p>
        </div>

        {/* ===== PHOTO CAROUSEL – Light Gradient Container & Continuous Auto-Slide ===== */}
        <div className="mb-14 sm:mb-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
            <div>
              <h3 className="font-display text-2xl font-bold text-slate-900 flex items-center gap-3">
                <span>📸 Photo Gallery</span>
              </h3>
              <p className="text-sm text-slate-600 font-sans mt-1">
                Photos from our previous symposium
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500 hidden sm:inline-block">
              Hover to pause · Click photo to expand
            </span>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-sky-200/90 shadow-[0_20px_50px_rgba(14,165,233,0.1)] bg-white/80 backdrop-blur-xl">
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#F0F7FF] to-transparent z-20 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#F0F7FF] to-transparent z-20 pointer-events-none" />

            <div className="overflow-hidden py-8">
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
                      overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-md
                      bg-gradient-to-br ${gradientStyles[index % gradientStyles.length]}
                      transition-all duration-300 hover:scale-[1.04] hover:border-sky-500 hover:shadow-[0_20px_40px_rgba(14,165,233,0.25)]
                    `}
                  >
                    {photo.url ? (
                      <img
                        src={photo.url}
                        alt={photo.title || `Photo ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ===== VIDEO SECTION – Highlighted Cards & Interactive Player ===== */}
        <div id="video-album-section">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-8">
            <div>
              <h3 className="font-display text-2xl font-bold text-slate-900 flex items-center gap-3">
                <span>🎬 Event Highlights</span>
              </h3>
              <p className="text-sm text-slate-600 font-sans mt-1">
                Videos capturing the key moments and activities from the event
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500 hidden sm:inline-block">
              Click video to play
            </span>
          </div>

          {/* Videos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {visibleVideos.map((video, index) => {
              return (
                <div
                  key={`video-${video.id}-${index}`}
                  onClick={() => setActiveVideo(video)}
                  className={`
                    group relative aspect-video overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xl
                    bg-gradient-to-br ${gradientStyles[(index + 3) % gradientStyles.length]}
                    transition-all duration-300 hover:scale-[1.03] hover:border-pink-500 hover:shadow-[0_25px_50px_rgba(236,72,153,0.25)]
                    flex items-center justify-center cursor-pointer
                  `}
                >
                  {/* Thumbnail Image or Video Poster */}
                  {getVideoThumbnail(video.url) ? (
                    <img
                      src={getVideoThumbnail(video.url)!}
                      alt={video.title || `Highlight Video ${index + 1}`}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : video.url ? (
                    <video
                      src={video.url}
                      preload="metadata"
                      muted
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    />
                  ) : null}

                  {/* Subtle dark tint so play button pops */}
                  <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/10 transition-colors" />

                  {/* Play Button Overlay */}
                  <div className="relative z-10 flex items-center justify-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-white bg-slate-900/60 backdrop-blur-md flex items-center justify-center group-hover:bg-pink-600 group-hover:border-pink-300 group-hover:scale-110 transition-all shadow-2xl">
                      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white ml-1 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Trigger Area: View Full Event Album & Socials */}
          <div className="mt-12 flex flex-col items-center justify-center gap-4 text-center">
            <a
              href="https://www.instagram.com/creative_codex_club"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cyber inline-flex items-center gap-3 px-8 py-4 text-sm font-bold shadow-xl shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
            >
              <span>View Full Event Album &amp; Socials</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* ===== PHOTO LIGHTBOX MODAL ===== */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 sm:p-8 backdrop-blur-2xl animate-fade-in"
          onClick={() => setActivePhoto(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl p-4 sm:p-6 text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 z-20 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-full w-10 h-10 flex items-center justify-center font-mono text-lg transition border border-slate-300 font-bold"
            >
              ✕
            </button>

            {activePhoto.url ? (
              <img
                src={activePhoto.url}
                alt={activePhoto.title}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-2xl shadow-xl"
              />
            ) : (
              <div className="h-64 w-full flex items-center justify-center text-6xl">📸</div>
            )}

            <div className="mt-4 text-center space-y-1">
              <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900">{activePhoto.title}</h3>
              {activePhoto.caption && <p className="text-sm text-slate-600 max-w-xl font-sans">{activePhoto.caption}</p>}
            </div>
          </div>
        </div>
      )}

      {/* ===== VIDEO PLAYER MODAL ===== */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 sm:p-8 backdrop-blur-2xl animate-fade-in"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="relative max-w-4xl w-full flex flex-col bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl p-4 sm:p-6 space-y-4 text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="font-mono text-[10px] uppercase text-pink-600 font-bold">Video Preview</span>
                <h3 className="font-display text-lg sm:text-2xl font-bold text-slate-900 line-clamp-1">
                  {activeVideo.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-full w-10 h-10 flex items-center justify-center font-mono text-lg transition border border-slate-300 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-200 shadow-2xl">
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
                <div className="w-full h-full flex items-center justify-center text-slate-400 font-mono">
                  No video stream URL found.
                </div>
              )}
            </div>

            {activeVideo.caption && (
              <p className="text-xs sm:text-sm text-slate-600 font-sans pt-1">
                {activeVideo.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
