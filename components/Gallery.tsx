const PLACEHOLDER_TILES = Array.from({ length: 8 }, (_, i) => i);

export default function Gallery() {
  return (
    <section id="gallery" className="border-t border-ink-line">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <p className="eyebrow mb-2">Archive</p>
        <h2 className="section-heading mb-8">Previous editions</h2>
        <p className="mb-8 max-w-xl text-sm text-muted">
          Photos and recap videos from past symposiums go here — drop files into{" "}
          <code className="font-mono text-signal">/public/media</code> and swap the tiles below.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PLACEHOLDER_TILES.map((i) => (
            <div
              key={i}
              className="flex aspect-square items-center justify-center rounded-sm border border-dashed border-ink-line bg-ink-surface font-mono text-[10px] uppercase tracking-widest text-muted"
            >
              Media {i + 1}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
