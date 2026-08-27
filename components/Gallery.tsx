"use client";

const PHOTO_TILES = Array.from({ length: 8 }, (_, i) => i);
const VIDEO_TILES = Array.from({ length: 4 }, (_, i) => i);

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

export default function Gallery() {
  // Duplicate the photo array for seamless looping
  const duplicatedPhotos = [...PHOTO_TILES, ...PHOTO_TILES];

  return (
    <section id="gallery" className="border-t border-white/5 bg-ink-surface/30 section-spacing">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="text-center mb-12">
          <p className="eyebrow mb-2">Archive</p>
          <h2 className="section-heading mb-4">Previous Editions</h2>
          <p className="mx-auto max-w-xl text-sm text-muted">
            Photos and recap videos from past symposiums — a glimpse of the energy and innovation
            we bring every year.
          </p>
        </div>

        {/* ===== PHOTO CAROUSEL – Continuous Auto‑Slide ===== */}
        <div className="mb-16">
          <h3 className="font-display text-xl font-semibold text-paper mb-4 flex items-center gap-2">
            📸 Photos
            <span className="text-xs font-mono text-muted font-normal">(continuous scroll)</span>
          </h3>

          <div className="relative overflow-hidden rounded-2xl border border-white/10">
            <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-ink-surface/30 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-ink-surface/30 to-transparent z-10 pointer-events-none" />

            <div className="overflow-hidden py-4">
              <div
                className="flex gap-4 w-max animate-marquee-reverse hover:animate-pause"
                style={{ animationDuration: "25s" }}
              >
                {duplicatedPhotos.map((i, index) => (
                  <div
                    key={`photo-${index}`}
                    className={`
                      group relative w-64 sm:w-72 aspect-video shrink-0
                      overflow-hidden rounded-2xl border border-white/10
                      bg-gradient-to-br ${gradientStyles[i % gradientStyles.length]}
                      transition-all duration-300 hover:scale-[1.02] hover:border-cyber-cyan/40 hover:shadow-glow-cyan
                      flex flex-col items-center justify-center text-center p-4
                    `}
                  >
                    <span className="text-4xl opacity-60 group-hover:opacity-100 transition-opacity">
                      📸
                    </span>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-paper/60 group-hover:text-paper transition-colors">
                      Photo {(i % PHOTO_TILES.length) + 1}
                    </p>
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-ink/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ===== VIDEO THUMBNAILS ===== */}
        <div>
          <h3 className="font-display text-xl font-semibold text-paper mb-4 flex items-center gap-2">
            🎬 Videos
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {VIDEO_TILES.map((i) => (
              <div
                key={`video-${i}`}
                className={`
                  group relative aspect-video overflow-hidden rounded-2xl border border-white/10
                  bg-gradient-to-br ${gradientStyles[(i + 3) % gradientStyles.length]}
                  transition-all duration-300 hover:scale-[1.02] hover:border-cyber-cyan/40 hover:shadow-glow-cyan
                  flex flex-col items-center justify-center text-center p-4 cursor-pointer
                `}
              >
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
                  <div className="w-12 h-12 rounded-full border-2 border-white/60 flex items-center justify-center group-hover:border-cyber-cyan group-hover:scale-110 transition-all">
                    <svg className="w-6 h-6 text-white/80 group-hover:text-cyber-cyan ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                <span className="relative z-10 text-2xl opacity-60 group-hover:opacity-100 transition-opacity">
                  🎬
                </span>
                <p className="relative z-10 mt-1 font-mono text-[10px] uppercase tracking-widest text-paper/60 group-hover:text-paper transition-colors">
                  Recap {i + 1}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <a
              href="#contact"
              className="btn-cyber inline-flex"
            >
              View Full Album
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}