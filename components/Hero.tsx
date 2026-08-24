import { SYMPOSIUM_NAME, COLLEGE_NAME, CLUB_NAME, EVENTS } from "@/lib/eventsConfig";

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-ink-line">
      <div className="grid-backdrop absolute inset-0 h-full w-full opacity-60" />
      <div className="relative mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <p className="eyebrow mb-4">
          {CLUB_NAME} &middot; {COLLEGE_NAME}
        </p>
        <h1 className="font-display text-5xl font-medium leading-[1.05] tracking-tight text-paper sm:text-7xl">
          {SYMPOSIUM_NAME}
        </h1>
        <p className="mt-5 max-w-xl font-body text-base text-muted sm:text-lg">
          A national-level technical symposium — {EVENTS.length} events, one day,
          open to every campus in the country. Seats are tracked live below.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <a
            href="#events"
            className="rounded-sm bg-signal px-5 py-2.5 font-mono text-sm font-bold uppercase tracking-widest text-ink transition hover:bg-signal-soft"
          >
            View events &amp; seats
          </a>
          <a
            href="#contact"
            className="rounded-sm border border-ink-line px-5 py-2.5 font-mono text-sm uppercase tracking-widest text-muted transition hover:border-circuit hover:text-circuit"
          >
            Contact organizers
          </a>
        </div>
      </div>
    </section>
  );
}
