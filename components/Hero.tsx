// Hero.tsx — Cyber-themed landing section with:
//   1. Three-logo lockup with staggered hero-logo-enter animation
//      Left: College logo | Centre: Symposium logo (prominent) | Right: Club logo
//   2. AnnouncementBar (server-rendered, shows latest notice)
//   3. Primary CTA → Register Now (REGISTER_FORM_URL, new tab)
//   4. Secondary CTA → View Events (anchor #events)

import Image from "next/image";
import AnnouncementBar from "@/components/AnnouncementBar";
import {
  SYMPOSIUM_NAME,
  COLLEGE_NAME,
  CLUB_NAME,
  EVENTS,
  REGISTER_FORM_URL,
} from "@/lib/eventsConfig";

const stats = [
  { label: "Years", value: "2+" },
  { label: "Students", value: "300+" },
  { label: "Colleges", value: "40+" },
  { label: "Speakers", value: "12" },
];

export default function Hero() {
  return (
    <section
      className="relative overflow-hidden min-h-[92vh] flex items-center z-10"
      aria-label="Hero section"
    >
      {/* Depth orbs — low opacity so they don't fight the global cyber-bg */}
      <div
        aria-hidden="true"
        className="absolute top-[-8%] left-[-8%] w-[500px] h-[500px] rounded-full bg-cyber-cyan/8 blur-[120px] pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-[-8%] right-[-8%] w-[500px] h-[500px] rounded-full bg-cyber-magenta/8 blur-[120px] pointer-events-none"
      />

      <div className="relative mx-auto max-w-5xl px-5 sm:px-8 py-8 sm:py-12 lg:py-16 w-full text-center z-20 flex flex-col items-center gap-8">
        {/* ── 1. THREE-LOGO LOCKUP ────────────────────────────────────── */}
        {/* On mobile: stacked column. On sm+: side-by-side row.
            stagger-children applies animation-delay to each child in order. */}
        <div
          className="stagger-children w-full flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-6 lg:gap-8"
          aria-label="Organiser logos"
        >


          {/* Divider left */}
          <span
            aria-hidden="true"
            className="hero-logo-enter hidden sm:block h-16 w-px shrink-0 bg-gradient-to-b from-transparent via-cyber-cyan/35 to-transparent"
          />

          {/* CENTRE — Symposium logo (most prominent) */}
          <div className="hero-logo-enter flex items-center justify-center">
            <Image
              src="/logos/symologo1.png"
              alt={`${SYMPOSIUM_NAME} logo`}
              width={2600}
              height={900}
              className="h-50 sm:h-50 lg:h-50 w-auto max-w-[300px] sm:max-w-[400px] object-contain drop-shadow-[0_0_24px_rgba(0,240,255,0.25)]"
              priority
            />
          </div>

          {/* Divider right */}
          <span
            aria-hidden="true"
            className="hero-logo-enter hidden sm:block h-16 w-px shrink-0 bg-gradient-to-b from-transparent via-cyber-cyan/35 to-transparent"
          />

          {/* RIGHT — Club logo */}
          <div className="hero-logo-enter flex items-center justify-center">
            <Image
              src="/logos/cclogo1.png"
              alt={`Associated with ${CLUB_NAME}`}
              width={600}
              height={400}
              className="h-50 sm:h-50 lg:h-50 w-auto max-w-[500px] sm:max-w-[700px] object-contain drop-shadow-[0_0_12px_rgba(255,0,229,0.15)]"
              priority
            />
          </div>
          {/* Divider right */}
          <span
            aria-hidden="true"
            className="hero-logo-enter hidden sm:block h-16 w-px shrink-0 bg-gradient-to-b from-transparent via-cyber-cyan/35 to-transparent"
          />
        </div>
        {/* ── 2. ANNOUNCEMENT BANNER ─────────────────────────────────── */}
        <div className="w-full flex justify-center px-2">
          <AnnouncementBar />
        </div>

        {/* ── 3. EYEBROW + H1 ────────────────────────────────────────── */}
        <div className="stagger-children flex flex-col items-center gap-2">
          <p className="animate-on-scroll eyebrow">
            {COLLEGE_NAME} &middot; {CLUB_NAME}
          </p>

          <h1 className="animate-on-scroll font-display text-5xl sm:text-7xl lg:text-8xl font-semibold leading-[1.05] tracking-tight">
            <span className="text-paper">{SYMPOSIUM_NAME}</span>
            <span className="block gradient-text mt-1">
              National Symposium
            </span>
          </h1>
        </div>

        {/* ── 4. DATE / LOCATION CHIPS ───────────────────────────────── */}
        <div className="animate-on-scroll flex flex-wrap items-center justify-center gap-3 text-sm font-mono text-muted">
          <span className="flex items-center gap-2 rounded-full border border-cyber-cyan/20 bg-ink/80 backdrop-blur-sm px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-cyber-cyan animate-pulse" />
            📅 ? September 2026
          </span>
          <span aria-hidden="true" className="hidden sm:inline text-ink-line">·</span>
          <span className="flex items-center gap-2 rounded-full border border-cyber-cyan/20 bg-ink/80 backdrop-blur-sm px-4 py-1.5">
            📍 {COLLEGE_NAME}, Main Auditorium
          </span>
        </div>

        {/* ── 5. STATS STRIP ─────────────────────────────────────────── */}
        <div className="animate-on-scroll grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-xl mx-auto">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="glass rounded-2xl p-4 text-center transition-all duration-300 hover:border-cyber-cyan/40 hover:shadow-glow-cyan"
            >
              <p className="font-display text-3xl sm:text-4xl font-bold text-cyber-cyan">
                {stat.value}
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* ── 6. SUBHEADLINE ─────────────────────────────────────────── */}
        <p className="animate-on-scroll max-w-xl text-base sm:text-lg text-muted leading-relaxed">
          {EVENTS.length} electrifying events, industry experts, and students
          from across the country, one stage, limitless innovation.
        </p>

        {/* ── 7. CTA BUTTONS ─────────────────────────────────────────── */}
        <div className="animate-on-scroll flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
          {/* Primary: Register Now */}
          <a
            href={REGISTER_FORM_URL}
            target="_blank"
            rel="noreferrer"
            className="btn-cyber w-full sm:w-auto justify-center text-base px-8 py-3.5"
          >
            Register Now
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </a>

          {/* Secondary ghost: View Events */}
          <a
            href="#events"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-cyber-cyan/30 bg-transparent px-8 py-3.5 font-mono text-sm font-bold uppercase tracking-widest text-cyber-cyan w-full sm:w-auto transition-all duration-300 hover:bg-cyber-cyan/10 hover:border-cyber-cyan/60 hover:shadow-glow-cyan"
          >
            View Events
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}