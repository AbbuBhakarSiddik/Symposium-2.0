// Hero.tsx — Matte sky-blue themed landing section with yellow/gold text accents:
//   1. Big Logo Cards component for College, Symposium, and Club logos
//   2. AnnouncementBar (server-rendered, shows latest notice)
//   3. Primary CTA → Register Now (REGISTER_FORM_URL, new tab)
//   4. Secondary CTA → View Events (anchor #events)

import Image from "next/image";
import AnnouncementBar from "@/components/AnnouncementBar";
import LogoCards from "@/components/LogoCards";
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
      className="relative overflow-hidden min-h-[92vh] flex items-center z-10 bg-gradient-to-b from-[#075985] via-[#0284c7] to-[#0369a1] border-b border-sky-400/30 shadow-2xl text-white"
      aria-label="Hero section"
    >
      {/* Matte Sky-Blue Radial Overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-sky-400/20 via-transparent to-black/20 pointer-events-none"
      />

      {/* Depth ambient light orbs */}
      <div
        aria-hidden="true"
        className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-amber-400/15 blur-[140px] pointer-events-none animate-pulse"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-yellow-300/15 blur-[140px] pointer-events-none"
      />

      <div className="relative mx-auto max-w-5xl px-5 sm:px-8 py-10 sm:py-14 lg:py-18 w-full text-center z-20 flex flex-col items-center gap-8">
        {/* ── 1. BIG LOGO CARDS COMPONENT ────────────────────────────── */}
        <LogoCards />
        {/* ── 2. ANNOUNCEMENT BANNER ─────────────────────────────────── */}
        <div className="w-full flex justify-center px-2">
          <AnnouncementBar />
        </div>

        {/* ── 3. EYEBROW + H1 ────────────────────────────────────────── */}
        <div className="stagger-children flex flex-col items-center gap-3">
          <p className="animate-on-scroll font-mono text-xs uppercase tracking-widest text-amber-300 font-bold bg-slate-950/70 border border-amber-400/40 px-4 py-1.5 rounded-full shadow-md">
            {COLLEGE_NAME} &middot; {CLUB_NAME}
          </p>

          <h1 className="animate-on-scroll font-display text-5xl sm:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight">
            <span className="text-white drop-shadow-md">{SYMPOSIUM_NAME}</span>
            <span className="block bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 bg-clip-text text-transparent mt-1 drop-shadow">
              National Symposium
            </span>
          </h1>
        </div>

        {/* ── 4. DATE / LOCATION CHIPS ───────────────────────────────── */}
        <div className="animate-on-scroll flex flex-wrap items-center justify-center gap-3 text-sm font-mono text-slate-100">
          <span className="flex items-center gap-2 rounded-full border border-amber-400/50 bg-slate-950/70 backdrop-blur-md px-4 py-1.5 shadow-md">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            📅 ? September 2026
          </span>
          <span aria-hidden="true" className="hidden sm:inline text-sky-200">·</span>
          <span className="flex items-center gap-2 rounded-full border border-amber-400/50 bg-slate-950/70 backdrop-blur-md px-4 py-1.5 shadow-md">
            📍 {COLLEGE_NAME}, Main Auditorium
          </span>
        </div>

        {/* ── 5. STATS STRIP ─────────────────────────────────────────── */}
        <div className="animate-on-scroll grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-xl mx-auto">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-slate-950/60 border border-amber-400/30 backdrop-blur-md rounded-2xl p-4 text-center transition-all duration-300 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/20"
            >
              <p className="font-display text-3xl sm:text-4xl font-bold text-amber-300">
                {stat.value}
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-slate-200 font-bold">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* ── 6. SUBHEADLINE ─────────────────────────────────────────── */}
        <p className="animate-on-scroll max-w-xl text-base sm:text-lg text-slate-100 leading-relaxed font-sans font-medium">
          {EVENTS.length} electrifying events, industry experts, and students
          from across the country, one stage, limitless innovation.
        </p>

        {/* ── 7. CTA BUTTONS ─────────────────────────────────────────── */}
        <div className="animate-on-scroll flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
          {/* Primary: Register Now (Yellow/Gold Button) */}
          <a
            href={REGISTER_FORM_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 px-8 py-3.5 font-mono text-sm font-bold uppercase tracking-widest shadow-xl shadow-amber-500/30 hover:scale-105 transition-all duration-300"
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
            className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-400/50 bg-slate-950/60 backdrop-blur-md px-8 py-3.5 font-mono text-sm font-bold uppercase tracking-widest text-amber-300 w-full sm:w-auto transition-all duration-300 hover:bg-amber-400/20 hover:border-amber-300 hover:text-yellow-200 shadow-md"
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
